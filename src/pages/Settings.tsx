import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

export default function Settings() {
  const [form, setForm] = useState({
    brokerUrl: "mqtt://localhost:1883",
    username: "",
    password: "",
    darkMode: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleToggle = () => {
    setForm({ ...form, darkMode: !form.darkMode });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Settings Saved:", form);
    alert("Settings saved successfully!");
  };

  return (
    <DashboardLayout>
    <Card>
      <CardHeader>
        <CardTitle>Application Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="brokerUrl">Broker URL</Label>
            <Input
              id="brokerUrl"
              name="brokerUrl"
              value={form.brokerUrl}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="username">MQTT Username</Label>
            <Input
              id="username"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Optional"
            />
          </div>

          <div>
            <Label htmlFor="password">MQTT Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Optional"
            />
          </div>

          <div className="flex items-center space-x-2 md:col-span-2">
            <Switch checked={form.darkMode} onCheckedChange={handleToggle} />
            <Label>Enable Dark Mode</Label>
          </div>

          <div className="md:col-span-2">
            <Button type="submit" className="w-full">
              Save Settings
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
    </DashboardLayout>
  );
}
