import logo from "@/assets/xpay-logo.jpg";

export function Logo({ className = "h-10" }: { className?: string }) {
  return <img src={logo} alt="XPay" className={`${className} w-auto select-none`} draggable={false} />;
}
