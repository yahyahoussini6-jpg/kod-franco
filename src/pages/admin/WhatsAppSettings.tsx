import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Send, TestTube } from "lucide-react";
import { DataTable } from "@/components/analytics/DataTable";

interface WhatsAppLog {
  id: string;
  order_code: string;
  phone_e164: string;
  locale: string;
  template_name: string;
  direction: 'inbound' | 'outbound';
  response_status: number;
  wa_message_id: string;
  error_text: string;
  attempt_count: number;
  created_at: string;
}

interface WhatsAppSettings {
  AUTO_CONFIRM_ENABLED: string;
  WA_TEMPLATE_NAME: string;
  DELAY_MINUTES: string;
  DRY_RUN: string;
}

export default function WhatsAppSettings() {
  const [settings, setSettings] = useState<WhatsAppSettings>({
    AUTO_CONFIRM_ENABLED: 'false',
    WA_TEMPLATE_NAME: 'order_confirm',
    DELAY_MINUTES: '120',
    DRY_RUN: 'false'
  });
  const [testPhone, setTestPhone] = useState('');
  const [testName, setTestName] = useState('');
  const [testCode, setTestCode] = useState('');
  const [testAmount, setTestAmount] = useState('');
  const [testLang, setTestLang] = useState('fr');
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [logs, setLogs] = useState<WhatsAppLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const { toast } = useToast();

  const columns = [
    {
      key: "created_at",
      label: "Date",
      format: (value: string) => new Date(value).toLocaleString()
    },
    {
      key: "direction",
      label: "Direction",
      format: (value: string) => value
    },
    {
      key: "phone_e164",
      label: "Phone"
    },
    {
      key: "order_code",
      label: "Order Code"
    },
    {
      key: "template_name",
      label: "Template"
    },
    {
      key: "response_status",
      label: "Status",
      format: (value: number) => value ? value.toString() : 'Pending'
    },
    {
      key: "error_text",
      label: "Error",
      format: (value: string) => value || '-'
    }
  ];

  useEffect(() => {
    loadSettings();
    loadLogs();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase.rpc('get_whatsapp_settings');
      if (error) throw error;
      
      const settingsMap: WhatsAppSettings = {
        AUTO_CONFIRM_ENABLED: 'false',
        WA_TEMPLATE_NAME: 'order_confirm',
        DELAY_MINUTES: '120',
        DRY_RUN: 'false'
      };
      
      data?.forEach((setting: any) => {
        settingsMap[setting.setting_key as keyof WhatsAppSettings] = setting.setting_value;
      });
      
      setSettings(settingsMap);
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive"
      });
    }
  };

  const loadLogs = async () => {
    setLogsLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_whatsapp_logs', {
        p_limit: 100,
        p_offset: 0
      });
      if (error) throw error;
      setLogs((data || []).map((log: any) => ({
        ...log,
        direction: log.direction as 'inbound' | 'outbound'
      })));
    } catch (error) {
      console.error('Error loading logs:', error);
      toast({
        title: "Error",
        description: "Failed to load logs",
        variant: "destructive"
      });
    } finally {
      setLogsLoading(false);
    }
  };

  const updateSetting = async (key: keyof WhatsAppSettings, value: string) => {
    try {
      const { error } = await supabase.rpc('update_whatsapp_setting', {
        p_key: key,
        p_value: value
      });
      if (error) throw error;
      
      setSettings(prev => ({ ...prev, [key]: value }));
      toast({
        title: "Success",
        description: "Setting updated successfully"
      });
    } catch (error) {
      console.error('Error updating setting:', error);
      toast({
        title: "Error",
        description: "Failed to update setting",
        variant: "destructive"
      });
    }
  };

  const handleSendTest = async () => {
    if (!testPhone || !testName || !testCode || !testAmount) {
      toast({
        title: "Error",
        description: "Please fill in all test fields",
        variant: "destructive"
      });
      return;
    }

    setIsTesting(true);
    try {
      // This would call the edge function to send a test message
      // For now, we'll just simulate it
      toast({
        title: "Test Sent",
        description: `Test message would be sent to ${testPhone}`,
      });
      
      // Reload logs to show the test
      await loadLogs();
    } catch (error) {
      console.error('Error sending test:', error);
      toast({
        title: "Error",
        description: "Failed to send test message",
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };

  const triggerScheduledFunction = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-order-confirm');
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Processed ${data.processed} orders, sent ${data.sent} messages`,
      });
      
      await loadLogs();
    } catch (error) {
      console.error('Error triggering function:', error);
      toast({
        title: "Error",
        description: "Failed to trigger confirmation function",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">WhatsApp Settings</h1>
        <p className="text-muted-foreground">
          Configure WhatsApp auto-confirmation settings and monitor message logs.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Main Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Auto-Confirmation Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-confirm">Enable 2h Auto-Confirm</Label>
              <Switch
                id="auto-confirm"
                checked={settings.AUTO_CONFIRM_ENABLED === 'true'}
                onCheckedChange={(checked) => 
                  updateSetting('AUTO_CONFIRM_ENABLED', checked ? 'true' : 'false')
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                value={settings.WA_TEMPLATE_NAME}
                onChange={(e) => setSettings(prev => ({ ...prev, WA_TEMPLATE_NAME: e.target.value }))}
                onBlur={(e) => updateSetting('WA_TEMPLATE_NAME', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="delay-minutes">Delay (Minutes)</Label>
              <Input
                id="delay-minutes"
                type="number"
                value={settings.DELAY_MINUTES}
                onChange={(e) => setSettings(prev => ({ ...prev, DELAY_MINUTES: e.target.value }))}
                onBlur={(e) => updateSetting('DELAY_MINUTES', e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="dry-run">Dry Run Mode</Label>
              <Switch
                id="dry-run"
                checked={settings.DRY_RUN === 'true'}
                onCheckedChange={(checked) => 
                  updateSetting('DRY_RUN', checked ? 'true' : 'false')
                }
              />
            </div>

            <Button 
              onClick={triggerScheduledFunction}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Trigger Confirmation Check Now
            </Button>
          </CardContent>
        </Card>

        {/* Test Message */}
        <Card>
          <CardHeader>
            <CardTitle>Send Test Message</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="test-phone">Phone (E.164)</Label>
              <Input
                id="test-phone"
                placeholder="+212612345678"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="test-name">Customer Name</Label>
              <Input
                id="test-name"
                placeholder="Ahmed"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="test-code">Order Code</Label>
              <Input
                id="test-code"
                placeholder="TRK-ABC123"
                value={testCode}
                onChange={(e) => setTestCode(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="test-amount">Amount (MAD)</Label>
              <Input
                id="test-amount"
                type="number"
                placeholder="299"
                value={testAmount}
                onChange={(e) => setTestAmount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="test-lang">Language</Label>
              <Select value={testLang} onValueChange={setTestLang}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="ar">Arabic</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleSendTest}
              disabled={isTesting}
              className="w-full"
            >
              {isTesting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Send className="mr-2 h-4 w-4" />
              Send Test Message
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>WhatsApp Message Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {logsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <DataTable
              title="WhatsApp Logs"
              columns={columns}
              data={logs}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}