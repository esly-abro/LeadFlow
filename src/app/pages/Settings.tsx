import { useState, useRef, ChangeEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Switch } from '../components/ui/switch';
import { Plus, Trash2, Phone, MessageSquare, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

interface Profile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  timezone: string;
  avatar: string;
  [key: string]: string;
}

interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
}

interface CrmSettings {
  leadScoring: boolean;
  duplicateDetection: boolean;
}

interface SourceMapping {
  id: number;
  source: string;
  mapTo: string;
  status: string;
}

interface TelephonySettings {
  accountSid: string;
  apiKey: string;
  apiToken: string;
  exophone: string;
  clickToCall: boolean;
  callRecording: boolean;
  callDelay: number;
  [key: string]: string | number | boolean;
}

interface AutomationRule {
  id: number;
  name: string;
  trigger: string;
  action: string;
  enabled: boolean;
}

interface Integration {
  name: string;
  description: string;
  icon: string;
  connected: boolean;
}

interface Invoice {
  date: string;
  amount: string;
  status: string;
}

export default function Settings() {


  const [profile, setProfile] = useState<Profile>({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+1 (555) 123-4567',
    timezone: 'Eastern Time (ET)',
    avatar: ''
  });

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Member', status: 'Active' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'Member', status: 'Pending' },
  ]);

  const handleInviteMember = () => {
    const email = prompt('Enter email address of the new member:');
    if (email) {
      const newMember = {
        id: Date.now(),
        name: 'New Member',
        email,
        role: 'Member',
        status: 'Pending'
      };
      setTeamMembers([...teamMembers, newMember]);
    }
  };

  const handleDeleteMember = (id: number) => {
    if (confirm('Are you sure you want to remove this team member?')) {
      setTeamMembers(teamMembers.filter(m => m.id !== id));
    }
  };

  const handleRoleChange = (id: number, newRole: string) => {
    setTeamMembers(teamMembers.map(m =>
      m.id === id ? { ...m, role: newRole } : m
    ));
  };

  const [crmSettings, setCrmSettings] = useState({
    leadScoring: true,
    duplicateDetection: true
  });

  const [sourceMappings, setSourceMappings] = useState<SourceMapping[]>([
    { id: 1, source: 'meta_ads', mapTo: 'Facebook', status: 'Active' },
    { id: 2, source: 'google_ads', mapTo: 'Google AdWords', status: 'Active' },
    { id: 3, source: 'website', mapTo: 'Website', status: 'Active' },
    { id: 4, source: 'tiktok', mapTo: 'TikTok', status: 'Inactive' },
  ]);

  const handleAddSource = () => {
    const source = prompt('Enter lead source code (e.g., linkedin_ads):');
    if (!source) return;

    const mapTo = prompt('Enter Zoho CRM field value (e.g., LinkedIn):');
    if (!mapTo) return;

    const newMapping = {
      id: Date.now(),
      source,
      mapTo,
      status: 'Active'
    };
    setSourceMappings([...sourceMappings, newMapping]);
  };

  const handleToggleSourceStatus = (id: number) => {
    setSourceMappings(sourceMappings.map(m =>
      m.id === id ? { ...m, status: m.status === 'Active' ? 'Inactive' : 'Active' } : m
    ));
  };

  const handleSaveCrmSettings = () => {
    console.log('Saving CRM settings:', { crmSettings, sourceMappings });
    alert('CRM settings saved successfully!');
  };

  const [telephonySettings, setTelephonySettings] = useState<TelephonySettings>({
    accountSid: 'nil6910',
    apiKey: '5681199f2b0b********************',
    apiToken: '8b67707d5818********************',
    exophone: '',
    clickToCall: true,
    callRecording: true,
    callDelay: 60
  });

  const handleTelephonyChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setTelephonySettings(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleTestConnection = () => {
    // Mock test connection
    if (!telephonySettings.accountSid || !telephonySettings.apiKey) {
      alert('Please enter Account SID and API Key');
      return;
    }
    alert('Test call initiated successfully! Check your Exotel dashboard.');
  };

  const handleSaveTelephonySettings = () => {
    console.log('Saving Telephony settings:', telephonySettings);
    alert('Telephony settings saved successfully!');
  };

  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([
    { id: 1, name: 'Lead Assignment', trigger: 'New Lead Created', action: 'Assign to Round Robin', enabled: true },
    { id: 2, name: 'High Value Alert', trigger: 'Deal Value > $10k', action: 'Notify Manager', enabled: true },
    { id: 3, name: 'Stagnant Lead', trigger: 'No Activity for 3 Days', action: 'Send Email Reminder', enabled: false }
  ]);

  const toggleAutomationRule = (id: number) => {
    setAutomationRules(prev => prev.map(rule =>
      rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
    ));
  };

  const handleDeleteRule = (id: number) => {
    if (confirm('Are you sure you want to delete this rule?')) {
      setAutomationRules(prev => prev.filter(rule => rule.id !== id));
    }
  };

  const handleCreateRule = () => {
    const name = prompt('Enter rule name:');
    if (!name) return;

    // Simplification for demo: just adding a generic rule with the provided name
    const newRule = {
      id: Date.now(),
      name,
      trigger: 'Manual Trigger',
      action: 'Log Action',
      enabled: true
    };
    setAutomationRules(prev => [...prev, newRule]);
  };

  const handleConfigureZoho = () => {
    alert('Zoho CRM is currently connected via environment variables.\n\nTo re-configure, please update your .env file and restart the backend.');
  };

  const [activeTab, setActiveTab] = useState('profile');

  const handleExotelSettings = () => {
    setActiveTab('telephony');
  };

  const [integrations, setIntegrations] = useState<Integration[]>([
    { name: 'Slack', description: 'Send lead notifications to Slack channels', icon: '💬', connected: false },
    { name: 'Gmail', description: 'Sync emails and calendar', icon: '📧', connected: false },
    { name: 'Zapier', description: 'Connect with 3000+ apps', icon: '⚡', connected: false },
  ]);

  const handleConnectIntegration = (name: string) => {
    setIntegrations(prev => prev.map(int =>
      int.name === name ? { ...int, connected: !int.connected } : int
    ));
    const integration = integrations.find(i => i.name === name);
    if (integration && !integration.connected) {
      alert(`${name} connected successfully!`);
    } else {
      alert(`${name} disconnected.`);
    }
  };

  const [slackWebhook, setSlackWebhook] = useState('');

  const handleSaveSlackWebhook = () => {
    if (!slackWebhook) {
      alert('Please enter a valid Slack Webhook URL');
      return;
    }
    console.log('Saving Slack Webhook:', slackWebhook);
    alert('Slack Webhook URL saved successfully!');
  };

  const handleChangePlan = () => {
    alert('Subscription usage: 45/Unlimited leads.\n\nTo change your plan, please contact support or visit the billing portal.');
  };

  const handleUpdatePaymentMethod = () => {
    alert('Redirecting to secure payment provider...');
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    alert(`Downloading invoice for ${invoice.date} (${invoice.amount})...`);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProfileChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be less than 2MB');
        return;
      }
      const imageUrl = URL.createObjectURL(file);
      setProfile(prev => ({ ...prev, avatar: imageUrl }));
    }
  };

  const handleSaveProfile = () => {
    // In a real app, this would make an API call
    console.log('Saving profile:', profile);
    alert('Profile changes saved successfully!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account and preferences</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="crm">CRM</TabsTrigger>
          <TabsTrigger value="telephony">Telephony</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarFallback>{profile.firstName[0]}{profile.lastName[0]}</AvatarFallback>
                  {profile.avatar && <img src={profile.avatar} alt="Profile" className="h-full w-full object-cover" />}
                </Avatar>
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/png, image/jpeg, image/gif"
                    onChange={handleFileChange}
                  />
                  <Button variant="outline" onClick={handlePhotoClick}>Change Photo</Button>
                  <p className="text-sm text-gray-500 mt-2">JPG, PNG or GIF. Max size 2MB</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" value={profile.firstName} onChange={handleProfileChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" value={profile.lastName} onChange={handleProfileChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={profile.email} onChange={handleProfileChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" type="tel" value={profile.phone} onChange={handleProfileChange} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <select
                  id="timezone"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={profile.timezone}
                  onChange={handleProfileChange}
                >
                  <option>Eastern Time (ET)</option>
                  <option>Central Time (CT)</option>
                  <option>Mountain Time (MT)</option>
                  <option>Pacific Time (PT)</option>
                </select>
              </div>

              <Button onClick={handleSaveProfile}>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Team Members</CardTitle>
              <Button onClick={handleInviteMember}>
                <Plus className="h-4 w-4 mr-2" />
                Invite Member
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold">{member.name}</div>
                        <div className="text-sm text-gray-600">{member.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <select
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                        value={member.role}
                        onChange={(e) => handleRoleChange(member.id, e.target.value)}
                      >
                        <option>Admin</option>
                        <option>Member</option>
                        <option>Viewer</option>
                      </select>
                      <span className="text-sm text-gray-600 w-16 text-center">{member.status}</span>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteMember(member.id)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="crm">
          <Card>
            <CardHeader>
              <CardTitle>CRM Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">Lead Scoring</div>
                    <div className="text-sm text-gray-600">Automatically score leads based on engagement</div>
                  </div>
                  <Switch
                    checked={crmSettings.leadScoring}
                    onCheckedChange={(checked) => setCrmSettings(prev => ({ ...prev, leadScoring: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">Duplicate Detection</div>
                    <div className="text-sm text-gray-600">Prevent duplicate leads from being created</div>
                  </div>
                  <Switch
                    checked={crmSettings.duplicateDetection}
                    onCheckedChange={(checked) => setCrmSettings(prev => ({ ...prev, duplicateDetection: checked }))}
                  />
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium">Lead Source Mapping</h3>
                    <p className="text-sm text-gray-500">Map incoming lead sources to CRM fields</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleAddSource}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Source
                  </Button>
                </div>
                <div className="space-y-3">
                  {sourceMappings.map((mapping) => (
                    <div key={mapping.id} className="flex items-center gap-4 p-3 border rounded-md bg-gray-50">
                      <div className="flex-1">
                        <Label className="text-xs text-gray-500">Source</Label>
                        <div className="font-medium">{mapping.source}</div>
                      </div>
                      <div className="flex-1">
                        <Label className="text-xs text-gray-500">Maps to Zoho Field</Label>
                        <div className="font-medium">{mapping.mapTo}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${mapping.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}>
                          {mapping.status}
                        </span>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleToggleSourceStatus(mapping.id)}>
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-6">
                <Label>Default Lead Owner</Label>
                <select className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md">
                  <option>Round Robin</option>
                  <option>John Doe</option>
                  <option>Jane Smith</option>
                </select>
              </div>

              <Button onClick={handleSaveCrmSettings}>Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="telephony">
          <Card>
            <CardHeader>
              <CardTitle>Exotel Telephony Integration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-purple-50 border border-purple-100 rounded-lg flex items-start gap-3">
                <Phone className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-purple-900">Exotel Connected</h4>
                  <p className="text-sm text-purple-700">Calls are routed through Exotel (Trans). Click-to-call is enabled.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="accountSid">Exotel Account SID</Label>
                  <Input
                    id="accountSid"
                    type="password"
                    value={telephonySettings.accountSid}
                    onChange={handleTelephonyChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    value={telephonySettings.apiKey}
                    onChange={handleTelephonyChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apiToken">API Token</Label>
                  <Input
                    id="apiToken"
                    type="password"
                    value={telephonySettings.apiToken}
                    onChange={handleTelephonyChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="exophone">Exophone (Virtual Number)</Label>
                  <Input
                    id="exophone"
                    placeholder="Enter your Exophone number"
                    value={telephonySettings.exophone}
                    onChange={handleTelephonyChange}
                  />
                </div>
              </div>

              <div className="border-t pt-6 space-y-4">
                <h3 className="font-medium">Call Settings</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Click-to-Call</div>
                    <div className="text-sm text-gray-500">Enable calling directly from lead lists</div>
                  </div>
                  <Switch
                    checked={telephonySettings.clickToCall}
                    onCheckedChange={(checked) => setTelephonySettings(prev => ({ ...prev, clickToCall: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Call Recording</div>
                    <div className="text-sm text-gray-500">Automatically record all outbound calls</div>
                  </div>
                  <Switch
                    checked={telephonySettings.callRecording}
                    onCheckedChange={(checked) => setTelephonySettings(prev => ({ ...prev, callRecording: checked }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="callDelay">Call Delay (Seconds)</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="callDelay"
                      type="number"
                      className="w-24"
                      value={telephonySettings.callDelay}
                      onChange={handleTelephonyChange}
                    />
                    <span className="text-sm text-gray-500">Time to wait before connecting agent</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4">
                <Button variant="outline" onClick={handleTestConnection}>Test Connection</Button>
                <Button onClick={handleSaveTelephonySettings}>Save Telephony Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Automation Rules</CardTitle>
              <Button onClick={() => handleCreateRule()}>
                <Plus className="h-4 w-4 mr-2" />
                Create Rule
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {automationRules.map((rule) => (
                  <div key={rule.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-semibold">{rule.name}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          When: {rule.trigger}
                        </div>
                        <div className="text-sm text-gray-600">
                          Then: {rule.action}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={rule.enabled}
                          onCheckedChange={() => toggleAutomationRule(rule.id)}
                        />
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteRule(rule.id)}>
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Connected Integrations with Details */}
              <div className="space-y-4">
                <div className="border rounded-lg p-4 bg-white">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">Z</div>
                      <div>
                        <h3 className="font-bold">Zoho CRM</h3>
                        <p className="text-sm text-green-600 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Connected & Syncing
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleConfigureZoho}>Configure</Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-3 rounded">
                    <div>
                      <span className="text-gray-500">Client ID:</span>
                      <div className="font-mono">1000.ETAD...</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Last Sync:</span>
                      <div>2 mins ago</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Data Center:</span>
                      <div>India (.in)</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Status:</span>
                      <div className="text-green-600">Healthy</div>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4 bg-white">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-white font-bold">ex</div>
                      <div>
                        <h3 className="font-bold">Exotel</h3>
                        <p className="text-sm text-green-600 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Connected
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleExotelSettings}>Settings</Button>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-medium mb-4">Available Integrations</h3>
                <div className="grid grid-cols-1 gap-4">
                  {integrations.map((integration) => (
                    <div key={integration.name} className="p-4 border rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{integration.icon}</span>
                        <div>
                          <div className="font-semibold">{integration.name}</div>
                          <div className="text-sm text-gray-600">{integration.description}</div>
                        </div>
                      </div>
                      <Button
                        variant={integration.connected ? 'outline' : 'default'}
                        size="sm"
                        onClick={() => handleConnectIntegration(integration.name)}
                      >
                        {integration.connected ? 'Disconnect' : 'Connect'}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Slack Configuration Modal (Mock) */}
              <div className="border rounded-lg p-4 border-dashed border-gray-300">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="h-4 w-4 text-gray-500" />
                  <span className="font-medium text-gray-700">Slack Webhook URL</span>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://hooks.slack.com/services/..."
                    className="font-mono text-sm"
                    value={slackWebhook}
                    onChange={(e) => setSlackWebhook(e.target.value)}
                  />
                  <Button variant="secondary" onClick={handleSaveSlackWebhook}>Save</Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Paste your Incoming Webhook URL to receive lead alerts.
                </p>
              </div>

            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing & Subscription</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold">Professional Plan</h3>
                    <p className="text-gray-600">Unlimited leads and team members</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">$49</div>
                    <div className="text-sm text-gray-600">per month</div>
                  </div>
                </div>
                <Button variant="outline" onClick={handleChangePlan}>Change Plan</Button>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Payment Method</h4>
                <div className="p-4 border rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center">
                      💳
                    </div>
                    <div>
                      <div className="font-semibold">Visa ending in 4242</div>
                      <div className="text-sm text-gray-600">Expires 12/2025</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleUpdatePaymentMethod}>Update</Button>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Billing History</h4>
                <div className="space-y-2">
                  {[
                    { date: 'Dec 1, 2024', amount: '$49.00', status: 'Paid' },
                    { date: 'Nov 1, 2024', amount: '$49.00', status: 'Paid' },
                    { date: 'Oct 1, 2024', amount: '$49.00', status: 'Paid' },
                  ].map((invoice, index) => (
                    <div key={index} className="p-4 border rounded-lg flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{invoice.date}</div>
                        <div className="text-sm text-gray-600">{invoice.amount}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-green-600">{invoice.status}</span>
                        <Button variant="ghost" size="sm" onClick={() => handleDownloadInvoice(invoice)}>Download</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
