import Image from "next/image";

export default function Spinner({ className = "" }: { className?: string }) {
  return (
    <div className={`inline-flex items-center justify-center animate-spin ${className}`}>
      <Image src="/spinner_icon.png" alt="Loading..." width={32} height={32} className="object-contain w-full h-full" />
    </div>
  );
}
