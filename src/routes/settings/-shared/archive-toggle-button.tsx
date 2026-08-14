import { Button } from '#src/components/ui/button';

interface ArchiveToggleButtonProps {
  archived: boolean;
  archiveLabel: string;
  unarchiveLabel: string;
  onArchive: () => void;
  onUnarchive: () => void;
}

export function ArchiveToggleButton({
  archived,
  archiveLabel,
  unarchiveLabel,
  onArchive,
  onUnarchive,
}: ArchiveToggleButtonProps) {
  if (archived) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onPress={onUnarchive}
      >
        {unarchiveLabel}
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onPress={onArchive}
    >
      {archiveLabel}
    </Button>
  );
}
