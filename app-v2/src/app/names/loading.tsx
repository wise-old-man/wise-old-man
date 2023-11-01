export default function Loading() {
  return (
    <div className="custom-scroll overflow-x-auto">
      <ul className="flex flex-col gap-y-3 lg:mt-2 lg:gap-y-2">
        {[...Array(10)].map((_, i) => (
          <li
            key={`name_change_skeleton_${i}`}
            style={{ opacity: 1 - i * 0.1 }}
            className="h-[6.75rem] animate-pulse rounded-lg border border-gray-600 bg-gray-800 lg:h-[3.375rem]"
          />
        ))}
      </ul>
    </div>
  );
}
