mod fs;
mod git;
mod terminal;

use fs::{
    create_file, delete_file, get_workspace, list_dir, open_folder, read_file, rename_file,
    write_file, WorkspaceState,
};
use git::{git_create_commit, git_get_status, git_stage_all_files, git_stage_files};
use terminal::{
    terminal_execute, terminal_kill, terminal_list_shells, terminal_resize, terminal_spawn,
    terminal_write, TerminalManager,
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .manage(WorkspaceState::default())
        .manage(TerminalManager::default())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            open_folder,
            get_workspace,
            read_file,
            write_file,
            create_file,
            delete_file,
            rename_file,
            list_dir,
            terminal_list_shells,
            terminal_spawn,
            terminal_write,
            terminal_resize,
            terminal_kill,
            terminal_execute,
            git_get_status,
            git_stage_all_files,
            git_stage_files,
            git_create_commit,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
