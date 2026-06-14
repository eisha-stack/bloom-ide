use std::collections::HashMap;
use std::io::{Read, Write};
use std::path::PathBuf;
use std::process::{Command, Stdio};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::thread;

use parking_lot::Mutex;
use portable_pty::{native_pty_system, Child, CommandBuilder, MasterPty, PtySize};
use tauri::{AppHandle, Emitter};
use uuid::Uuid;

use super::error::{CommandError, TerminalError, TerminalResult};
use super::types::{
    CommandExecuteResult, CommandExitEvent, CommandOutputEvent, ShellInfo, TerminalExitEvent,
    TerminalOutputEvent, TerminalSpawnResult,
};

pub struct TerminalManager {
    sessions: Mutex<HashMap<String, TerminalSession>>,
}

struct TerminalSession {
    writer: Mutex<Box<dyn Write + Send>>,
    master: Arc<Mutex<Box<dyn MasterPty + Send>>>,
    _child: Box<dyn Child + Send + Sync>,
    alive: Arc<AtomicBool>,
}

impl Default for TerminalManager {
    fn default() -> Self {
        Self {
            sessions: Mutex::new(HashMap::new()),
        }
    }
}

fn default_cwd(workspace: Option<String>) -> PathBuf {
    workspace
        .map(PathBuf::from)
        .filter(|path| path.is_dir())
        .unwrap_or_else(|| std::env::current_dir().unwrap_or_else(|_| PathBuf::from(".")))
}

fn resolve_shell(shell: &str) -> Result<(String, Vec<String>), TerminalError> {
    let normalized = shell.to_lowercase();

    #[cfg(windows)]
    {
        match normalized.as_str() {
            "cmd" => Ok(("cmd.exe".into(), vec!["/K".into()])),
            "bash" => {
                if let Some(path) = find_windows_bash() {
                    Ok((path, vec![]))
                } else {
                    Err(TerminalError::UnsupportedShell(
                        "bash is not available. Install Git for Windows or WSL.".into(),
                    ))
                }
            }
            "powershell" | "pwsh" => {
                if let Some(path) = find_powershell() {
                    // No extra args — ConPTY provides an interactive session.
                    Ok((path, vec![]))
                } else {
                    Err(TerminalError::UnsupportedShell(
                        "PowerShell was not found on this system.".into(),
                    ))
                }
            }
            other => Err(TerminalError::UnsupportedShell(other.into())),
        }
    }

    #[cfg(not(windows))]
    {
        match normalized.as_str() {
            "bash" if path_exists("/bin/bash") => Ok(("/bin/bash".into(), vec!["-l".into()])),
            "bash" if path_exists("/usr/bin/bash") => {
                Ok(("/usr/bin/bash".into(), vec!["-l".into()]))
            }
            "cmd" => Err(TerminalError::UnsupportedShell(
                "CMD is only available on Windows.".into(),
            )),
            "powershell" | "pwsh" => Err(TerminalError::UnsupportedShell(
                "PowerShell is only available on Windows.".into(),
            )),
            "sh" | "bash" => Ok(("/bin/sh".into(), vec!["-l".into()])),
            other => Err(TerminalError::UnsupportedShell(other.into())),
        }
    }
}

fn path_exists(path: &str) -> bool {
    std::path::Path::new(path).exists()
}

#[cfg(windows)]
fn find_powershell() -> Option<String> {
    for candidate in ["pwsh.exe", "powershell.exe"] {
        if which_on_path(candidate) {
            return Some(candidate.into());
        }
    }
    None
}

#[cfg(windows)]
fn find_windows_bash() -> Option<String> {
    let candidates = [
        r"C:\Program Files\Git\bin\bash.exe",
        r"C:\Program Files (x86)\Git\bin\bash.exe",
    ];
    for candidate in candidates {
        if path_exists(candidate) {
            return Some(candidate.into());
        }
    }
    if which_on_path("bash.exe") {
        return Some("bash.exe".into());
    }
    None
}

#[cfg(windows)]
fn which_on_path(exe: &str) -> bool {
    std::process::Command::new("where")
        .arg(exe)
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .map(|status| status.success())
        .unwrap_or(false)
}

pub fn available_shells() -> Vec<ShellInfo> {
    #[cfg(windows)]
    {
        vec![
            ShellInfo {
                id: "powershell".into(),
                name: "PowerShell".into(),
                available: find_powershell().is_some(),
            },
            ShellInfo {
                id: "cmd".into(),
                name: "Command Prompt".into(),
                available: which_on_path("cmd.exe"),
            },
            ShellInfo {
                id: "bash".into(),
                name: "Bash".into(),
                available: find_windows_bash().is_some(),
            },
        ]
    }

    #[cfg(not(windows))]
    {
        vec![
            ShellInfo {
                id: "bash".into(),
                name: "Bash".into(),
                available: path_exists("/bin/bash") || path_exists("/usr/bin/bash"),
            },
            ShellInfo {
                id: "sh".into(),
                name: "Shell".into(),
                available: path_exists("/bin/sh"),
            },
        ]
    }
}

impl TerminalManager {
    pub fn list_shells() -> Vec<ShellInfo> {
        available_shells()
    }

    pub fn spawn(
        &self,
        app: AppHandle,
        shell: Option<String>,
        cwd: Option<String>,
        cols: u16,
        rows: u16,
    ) -> TerminalResult<TerminalSpawnResult> {
        let shell_id = shell.unwrap_or_else(default_shell_id);
        let (program, args) = resolve_shell(&shell_id).map_err(CommandError::from)?;
        let cwd_path = default_cwd(cwd);
        let session_id = Uuid::new_v4().to_string();

        let pty_system = native_pty_system();
        let pair = pty_system
            .openpty(PtySize {
                rows,
                cols,
                pixel_width: 0,
                pixel_height: 0,
            })
            .map_err(|error| TerminalError::SpawnFailed(error.to_string()))?;

        let mut cmd = CommandBuilder::new(&program);
        for arg in args {
            cmd.arg(arg);
        }
        cmd.cwd(&cwd_path);
        cmd.env("TERM", "xterm-256color");
        cmd.env("COLORTERM", "truecolor");

        let child = pair
            .slave
            .spawn_command(cmd)
            .map_err(|error| TerminalError::SpawnFailed(error.to_string()))?;

        let reader = pair
            .master
            .try_clone_reader()
            .map_err(|error| TerminalError::SpawnFailed(error.to_string()))?;
        let writer = pair
            .master
            .take_writer()
            .map_err(|error| TerminalError::SpawnFailed(error.to_string()))?;

        let alive = Arc::new(AtomicBool::new(true));
        let alive_for_thread = Arc::clone(&alive);
        let session_id_for_thread = session_id.clone();
        let app_for_thread = app.clone();

        thread::spawn(move || {
            read_loop(
                reader,
                app_for_thread,
                session_id_for_thread,
                alive_for_thread,
            );
        });

        let master = Arc::new(Mutex::new(pair.master));
        self.sessions.lock().insert(
            session_id.clone(),
            TerminalSession {
                writer: Mutex::new(writer),
                master,
                _child: child,
                alive,
            },
        );

        Ok(TerminalSpawnResult {
            session_id,
            shell: shell_id,
            cwd: cwd_path.to_string_lossy().into_owned(),
        })
    }

    pub fn write(&self, session_id: &str, data: &str) -> TerminalResult<()> {
        let sessions = self.sessions.lock();
        let session = sessions
            .get(session_id)
            .ok_or_else(|| TerminalError::NotFound(session_id.into()))?;

        let mut writer = session.writer.lock();
        writer
            .write_all(data.as_bytes())
            .and_then(|_| writer.flush())
            .map_err(|error| TerminalError::WriteFailed(error.to_string()))?;
        Ok(())
    }

    pub fn resize(&self, session_id: &str, cols: u16, rows: u16) -> TerminalResult<()> {
        let sessions = self.sessions.lock();
        let session = sessions
            .get(session_id)
            .ok_or_else(|| TerminalError::NotFound(session_id.into()))?;

        session
            .master
            .lock()
            .resize(PtySize {
                rows,
                cols,
                pixel_width: 0,
                pixel_height: 0,
            })
            .map_err(|error| TerminalError::ResizeFailed(error.to_string()))?;
        Ok(())
    }

    pub fn kill(&self, session_id: &str) -> TerminalResult<()> {
        let mut sessions = self.sessions.lock();
        if let Some(session) = sessions.remove(session_id) {
            session.alive.store(false, Ordering::SeqCst);
            let _ = session.master.lock().resize(PtySize {
                rows: 1,
                cols: 1,
                pixel_width: 0,
                pixel_height: 0,
            });
        }
        Ok(())
    }

    pub fn execute(
        &self,
        app: AppHandle,
        command: String,
        shell: Option<String>,
        cwd: Option<String>,
    ) -> TerminalResult<CommandExecuteResult> {
        let shell_id = shell.unwrap_or_else(default_shell_id);
        let (program, _) = resolve_shell(&shell_id).map_err(CommandError::from)?;
        let cwd_path = default_cwd(cwd);
        let execution_id = Uuid::new_v4().to_string();
        let execution_id_for_thread = execution_id.clone();
        let app_for_thread = app.clone();

        thread::spawn(move || {
            let success = run_command_with_streaming(
                app_for_thread.clone(),
                &shell_id,
                program,
                command,
                cwd_path,
                execution_id_for_thread.clone(),
            );
            let _ = app_for_thread.emit(
                "command-exit",
                CommandExitEvent {
                    execution_id: execution_id_for_thread,
                    code: if success { Some(0) } else { Some(1) },
                    success,
                },
            );
        });

        Ok(CommandExecuteResult { execution_id })
    }
}

fn default_shell_id() -> String {
    #[cfg(windows)]
    {
        "powershell".into()
    }
    #[cfg(not(windows))]
    {
        "bash".into()
    }
}

fn read_loop(
    mut reader: Box<dyn Read + Send>,
    app: AppHandle,
    session_id: String,
    alive: Arc<AtomicBool>,
) {
    let mut buffer = [0u8; 8192];

    while alive.load(Ordering::SeqCst) {
        match reader.read(&mut buffer) {
            Ok(0) => break,
            Ok(count) => {
                let data = String::from_utf8_lossy(&buffer[..count]).into_owned();
                let _ = app.emit(
                    "terminal-output",
                    TerminalOutputEvent {
                        session_id: session_id.clone(),
                        data,
                    },
                );
            }
            Err(error) => {
                log::warn!("terminal read error ({session_id}): {error}");
                break;
            }
        }
    }

    alive.store(false, Ordering::SeqCst);
    let _ = app.emit(
        "terminal-exit",
        TerminalExitEvent {
            session_id,
            code: None,
        },
    );
}

fn run_command_with_streaming(
    app: AppHandle,
    shell_id: &str,
    program: String,
    command: String,
    cwd: PathBuf,
    execution_id: String,
) -> bool {
    let mut process = Command::new(&program);
    process.current_dir(&cwd);
    process.stdout(Stdio::piped());
    process.stderr(Stdio::piped());

    #[cfg(windows)]
    match shell_id {
        "cmd" => {
            process.arg("/C");
            process.arg(&command);
        }
        "bash" => {
            process.arg("-lc");
            process.arg(&command);
        }
        _ => {
            process.arg("-NoLogo");
            process.arg("-Command");
            process.arg(&command);
        }
    }

    #[cfg(not(windows))]
    {
        let _ = shell_id;
        process.arg("-lc");
        process.arg(&command);
    }

    match process.spawn() {
        Ok(mut child) => {
            if let Some(mut stdout) = child.stdout.take() {
                stream_reader(&app, &execution_id, &mut stdout);
            }
            if let Some(mut stderr) = child.stderr.take() {
                stream_reader(&app, &execution_id, &mut stderr);
            }

            child
                .wait()
                .map(|status| status.success())
                .unwrap_or(false)
        }
        Err(error) => {
            let _ = app.emit(
                "command-output",
                CommandOutputEvent {
                    execution_id,
                    data: format!("Failed to execute command: {error}\n"),
                },
            );
            false
        }
    }
}

fn stream_reader(app: &AppHandle, execution_id: &str, reader: &mut impl Read) {
    let mut buffer = [0u8; 4096];
    loop {
        match reader.read(&mut buffer) {
            Ok(0) => break,
            Ok(count) => {
                let data = String::from_utf8_lossy(&buffer[..count]).into_owned();
                let _ = app.emit(
                    "command-output",
                    CommandOutputEvent {
                        execution_id: execution_id.to_string(),
                        data,
                    },
                );
            }
            Err(_) => break,
        }
    }
}
