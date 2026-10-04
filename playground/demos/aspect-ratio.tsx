import { AspectRatio, Grid } from '../../src'
import { Example } from '../components/demo'

const fill =
  'flex size-full items-center justify-center bg-linear-to-br from-primary/25 via-primary/10 to-transparent font-mono text-sm text-muted-foreground'

export default function AspectRatioDemo() {
  return (
    <div className="space-y-12">
      <Example title="16 / 9" layout="stack">
        <AspectRatio ratio={16 / 9} className="rounded-xl border">
          <div className={fill}>16 / 9</div>
        </AspectRatio>
      </Example>

      <Example title="Common ratios" layout="stack">
        <Grid columns={{ base: 2, md: 4 }} gap={4}>
          {[
            ['1 / 1', 1],
            ['4 / 3', 4 / 3],
            ['3 / 4', 3 / 4],
            ['21 / 9', 21 / 9],
          ].map(([label, ratio]) => (
            <AspectRatio key={label} ratio={ratio as number} className="rounded-lg border">
              <div className={fill}>{label}</div>
            </AspectRatio>
          ))}
        </Grid>
      </Example>
    </div>
  )
}
