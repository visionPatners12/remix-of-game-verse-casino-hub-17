import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { NotificationSettings as NotificationSettingsType } from "../types";

interface NotificationSettingsProps {
  settings: NotificationSettingsType;
  onUpdate: (updates: Partial<NotificationSettingsType>) => Promise<void>;
  isUpdating?: boolean;
}

export function NotificationSettings({ settings, onUpdate, isUpdating = false }: NotificationSettingsProps) {
  return (
    <div className="space-y-4 py-4 px-4">
      <div className="flex items-center justify-between py-2">
        <div className="space-y-0.5">
          <Label htmlFor="push">Push notifications</Label>
          <p className="text-sm text-muted-foreground">
            Notifications in your browser
          </p>
        </div>
        <Switch
          id="push"
          checked={settings.push}
          onCheckedChange={(checked) => onUpdate({ push: checked })}
          disabled={isUpdating}
        />
      </div>

      <div className="flex items-center justify-between py-2">
        <div className="space-y-0.5">
          <Label htmlFor="email">Email</Label>
          <p className="text-sm text-muted-foreground">
            Receive notifications by email
          </p>
        </div>
        <Switch
          id="email"
          checked={settings.email}
          onCheckedChange={(checked) => onUpdate({ email: checked })}
          disabled={isUpdating}
        />
      </div>
    </div>
  );
}
