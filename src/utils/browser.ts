export function removeContextMenu() {
  const deactivateContextMenu = (event: { preventDefault: () => void; }) => {
    event.preventDefault();
  };

  const handleKeydown = (event: { ctrlKey: any; metaKey: any; key: string; preventDefault: () => void; }) => {
    // Check for Ctrl or Cmd key combinations
    if (
      (event.ctrlKey || event.metaKey) && // Ctrl on Windows/Linux or Cmd on macOS
      (event.key === 'p' || event.key === 's' || event.key === 'r' || event.key === 'f')
    ) {
      event.preventDefault();
      console.log(`Default shortcut for ${event.key.toUpperCase()} disabled`);
    }

    // prevent other default shortcut
  };

  // Add event listeners
  document.addEventListener('contextmenu', deactivateContextMenu);
  document.addEventListener('keydown', handleKeydown);

  // Cleanup event listeners on unmount
  return () => {
    document.removeEventListener('contextmenu', deactivateContextMenu);
    document.removeEventListener('keydown', handleKeydown);
  };
}
