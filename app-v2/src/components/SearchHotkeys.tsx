import { isAppleDevice } from "~/utils/platform";

export default function SearchHotkeys() {
  return (
    <div className="pointer-events-none absolute bottom-0 right-3 top-0 hidden items-center font-medium text-gray-400 sm:flex">
      {isAppleDevice() ? (
        <kbd className="mr-px font-mono text-lg font-bold">⌘</kbd>
      ) : (
        <kbd className="font-mono text-xs font-bold">ctrl</kbd>
      )}
      <kbd className="font-mono text-xs font-bold tracking-widest">+K</kbd>
    </div>
  );
}
