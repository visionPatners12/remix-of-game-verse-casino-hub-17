import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DisplaySettings } from './DisplaySettings';
import { AppSettings } from './AppSettings';
import { usePreferences } from '../hooks/usePreferences';
import { useAuth } from '@/hooks/useAuth';

export const PreferencesSettings = () => {
  const { user } = useAuth();
  const { state, actions } = usePreferences();

  React.useEffect(() => {
    if (user?.id) {
      actions.fetchPreferences(user.id);
    }
  }, [user?.id]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Display Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <DisplaySettings 
            settings={state.preferences?.displaySettings}
            onUpdate={(settings) => actions.updatePreferences({ displaySettings: settings })}
            isLoading={state.isLoading}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>App Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <AppSettings
            settings={state.preferences?.appSettings}
            onUpdate={(settings) => actions.updatePreferences({ appSettings: settings })}
            isLoading={state.isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
};