import {
  FolderOpen,
  FolderPlus,
  GitBranch,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'

export type LandingActionId = 'new-project' | 'open-folder' | 'clone' | 'continue-ai'

export type LandingAction = {
  id: LandingActionId
  label: string
  description: string
  icon: LucideIcon
  variant: 'primary' | 'secondary'
}

export const LANDING_ACTIONS: LandingAction[] = [
  {
    id: 'new-project',
    label: 'New Project',
    description: 'Start fresh with a template',
    icon: FolderPlus,
    variant: 'secondary',
  },
  {
    id: 'open-folder',
    label: 'Open Folder',
    description: 'Browse your local workspace',
    icon: FolderOpen,
    variant: 'secondary',
  },
  {
    id: 'clone',
    label: 'Clone Repository',
    description: 'Import from GitHub or GitLab',
    icon: GitBranch,
    variant: 'secondary',
  },
  {
    id: 'continue-ai',
    label: 'Continue with AI',
    description: 'Let Bloom guide your first steps',
    icon: Sparkles,
    variant: 'primary',
  },
]

export const PRODUCT_ALIASES = [
  'Blossom IDE',
  'Aurora IDE',
  'Sakura Studio',
  'LavenderCode',
  'Velvet IDE',
]
