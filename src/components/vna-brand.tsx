import logoAsset from "@/assets/vna-logo-official.jpg.asset.json";
import { cn } from "@/lib/utils";

export function VnaBrand({ compact = false, inverse = false }: { compact?: boolean; inverse?: boolean }) {
  return (
    <div className={cn("flex items-center gap-3", inverse && "text-primary-foreground")}>
      <img
        src={logoAsset.url}
        alt="Vida no Altar"
        width={72}
        height={72}
        className={cn("rounded-full object-cover", compact ? "size-10" : "size-12")}
      />
      <div className="leading-none">
        <span className="font-display text-lg uppercase">Vida no Altar</span>
        {!compact && <span className="mt-1 block text-[9px] uppercase tracking-[0.18em] opacity-70">Presença que transforma</span>}
      </div>
    </div>
  );
}