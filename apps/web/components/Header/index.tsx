const formattedDate = new Date().toLocaleDateString("en-GB", {
  day: "2-digit",
  month: "short",
});

export default function Header({ userName = "Guest" }: { userName?: string }) {
  return (
    <header className="bg-primary text-white">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <span className="font-semibold">{userName}</span>
        <span className="text-primary-light text-sm">{formattedDate}</span>
      </div>
    </header>
  );
}
