import { useState } from 'react'
import {
  Avatar,
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Skeleton,
  SkeletonText,
  Switch,
  Text,
} from '../../src'
import { Example } from '../components/demo'

export default function SkeletonDemo() {
  const [loading, setLoading] = useState(true)

  return (
    <div className="space-y-12">
      <Example title="Shapes" layout="stack">
        <div className="flex items-center gap-4">
          <Skeleton className="size-12 rounded-full" />
          <div className="grid flex-1 gap-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
        <SkeletonText lines={4} />
      </Example>

      <Example title="Loading → loaded" layout="stack">
        <Switch label="Loading" checked={loading} onCheckedChange={setLoading} />
        <Grid columns={{ base: 1, sm: 3 }} gap={4}>
          {['Aurora', 'Nimbus', 'Zephyr'].map((name) => (
            <Card key={name}>
              <CardHeader className="flex items-center gap-3">
                {loading ? (
                  <>
                    <Skeleton className="size-10 rounded-full" />
                    <div className="grid flex-1 gap-2">
                      <Skeleton className="h-3.5 w-2/3" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </>
                ) : (
                  <>
                    <Avatar name={name} />
                    <div>
                      <Text size="sm" weight="medium">
                        {name}
                      </Text>
                      <Text size="xs" tone="muted">
                        Updated 2h ago
                      </Text>
                    </div>
                  </>
                )}
              </CardHeader>
              <CardContent className="grid gap-4">
                {loading ? (
                  <>
                    <SkeletonText lines={2} />
                    <Skeleton className="h-8 w-24" />
                  </>
                ) : (
                  <>
                    <Text size="sm" tone="muted">
                      Edge functions, analytics and preview deployments.
                    </Text>
                    <Button size="sm" variant="outline" className="w-fit">
                      Open
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </Grid>
      </Example>
    </div>
  )
}
