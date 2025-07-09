export default function AssistantPage() {
  return (
    <div className="w-full h-full bg-sidebar rounded-lg border border-border flex flex-col">
      <div className="p-4 text-2xl font-semibold border-b border-border bg-white rounded-t-lg w-full">
        Assistants
      </div>

      <div className="m-2 rounded-lg flex-1 flex flex-row gap-2">
        <div className="flex items-center justify-between bg-white flex-1 rounded-lg"></div>
        <div className="flex items-center justify-between bg-white flex-3 rounded-lg">
          <div className="text-lg font-semibold">Assistant 1</div>
        </div>
      </div>
    </div>
  );
}
