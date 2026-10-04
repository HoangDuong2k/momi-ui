import { BarChart3, Bell, CreditCard, User } from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  FormField,
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
} from '../../src'
import { Example } from '../components/demo'

export default function TabsDemo() {
  return (
    <div className="space-y-12">
      <Example title="Segmented (default)" layout="stack" pattern>
        <Tabs defaultValue="account" className="w-full max-w-md">
          <TabsList fullWidth>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
          </TabsList>
          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Account</CardTitle>
                <CardDescription>Update your account details.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <FormField label="Name">
                  <Input defaultValue="Linh Tran" />
                </FormField>
              </CardContent>
              <CardFooter>
                <Button>Save</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>You&apos;ll be signed out after changing it.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <FormField label="New password">
                  <Input type="password" />
                </FormField>
              </CardContent>
              <CardFooter>
                <Button>Update password</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </Example>

      <Example title="Underline" layout="stack">
        <Tabs defaultValue="overview">
          <TabsList variant="underline">
            <TabsTrigger value="overview">
              <BarChart3 />
              Overview
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="billing">
              <CreditCard />
              Billing
            </TabsTrigger>
            <TabsTrigger value="disabled" disabled>
              Disabled
            </TabsTrigger>
          </TabsList>
          {['overview', 'notifications', 'billing'].map((v) => (
            <TabsContent key={v} value={v}>
              <Text size="sm" tone="muted">
                Content for the <span className="font-medium text-foreground">{v}</span> tab.
              </Text>
            </TabsContent>
          ))}
        </Tabs>
      </Example>

      <Example title="Pills" layout="stack">
        <Tabs defaultValue="monthly">
          <TabsList variant="pills">
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">Yearly</TabsTrigger>
            <TabsTrigger value="lifetime">Lifetime</TabsTrigger>
          </TabsList>
        </Tabs>
      </Example>

      <Example title="Vertical" layout="stack">
        <Tabs defaultValue="profile" orientation="vertical">
          <TabsList variant="underline">
            <TabsTrigger value="profile">
              <User />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="billing">
              <CreditCard />
              Billing
            </TabsTrigger>
          </TabsList>
          {['profile', 'notifications', 'billing'].map((v) => (
            <TabsContent key={v} value={v} className="ps-2">
              <Text weight="medium" className="capitalize">
                {v}
              </Text>
              <Text size="sm" tone="muted">
                Vertical tabs work well for settings pages.
              </Text>
            </TabsContent>
          ))}
        </Tabs>
      </Example>
    </div>
  )
}
