import { Bus, ExternalLink, MapPinned } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LiveBusTracker() {
  return (
    <section aria-labelledby="live-bus-tracker" className="space-y-4 border-y py-5">
      <div className="flex items-center gap-3">
        <MapPinned className="h-6 w-6 shrink-0 text-accent" aria-hidden />
        <div>
          <h3 id="live-bus-tracker" className="text-xl font-bold">Live bus tracker</h3>
          <p className="text-sm text-muted-foreground">Official agency trackers · open in a new tab</p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Button asChild className="h-auto min-h-14 whitespace-normal px-4 py-3">
          <a href="https://myddotbus.com/" target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer">
            <Bus aria-hidden /> Track DDOT buses <ExternalLink aria-hidden />
          </a>
        </Button>
        <Button asChild variant="outline" className="h-auto min-h-14 whitespace-normal px-4 py-3">
          <a href="https://www.mysmartbus.com/map" target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer">
            <Bus aria-hidden /> Track SMART buses <ExternalLink aria-hidden />
          </a>
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">Live arrival estimates come from the transit agency. The trip map and next-bus times below remain sample estimates, not live predictions.</p>
    </section>
  );
}