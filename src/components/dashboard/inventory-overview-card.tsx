import { Package, Laptop, Smartphone, Headphones, HardDrive, CardSim } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { InventoryStats } from '@/lib/actions/dashboard'
import { cn } from '@/lib/utils'

interface InventoryOverviewCardProps {
  stats: InventoryStats
  className?: string
}

export function InventoryOverviewCard({ stats, className }: InventoryOverviewCardProps) {
  const inUsePercentage =
    stats.total > 0 ? Math.round((stats.byStatus.inUse / stats.total) * 100) : 0

  return (
    <Card className={cn('@container/card3', className)}>
      <CardHeader>
        <CardDescription>Total Inventory</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {stats.total}
        </CardTitle>
        <CardAction>
          <Badge variant="outline">
            <Package className="h-4 w-4" />
            {inUsePercentage}% In Use
          </Badge>
        </CardAction>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-3 text-sm">
        {/* Equipment breakdown */}
        <div className="w-full">
          <div className="font-medium mb-2">Equipment Types</div>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
            <div className="flex items-center gap-2">
              <Laptop className="h-4 w-4 text-blue-600" />
              <span className="font-medium">{stats.byType.laptops}</span>
              <span className="text-muted-foreground text-xs">Laptops</span>
            </div>
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-green-600" />
              <span className="font-medium">{stats.byType.phones}</span>
              <span className="text-muted-foreground text-xs">Phones</span>
            </div>
            <div className="flex items-center gap-2">
              <CardSim className="h-4 w-4 text-green-600" />
              <span className="font-medium">{stats.byType.simCards}</span>
              <span className="text-muted-foreground text-xs">SIM Cards</span>
            </div>
            <div className="flex items-center gap-2">
              <Headphones className="h-4 w-4 text-purple-600" />
              <span className="font-medium">{stats.byType.accessories}</span>
              <span className="text-muted-foreground text-xs">Accessories</span>
            </div>
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-orange-600" />
              <span className="font-medium">{stats.byType.other}</span>
              <span className="text-muted-foreground text-xs">Other</span>
            </div>
          </div>
        </div>

        {/* Status breakdown */}
        <div className="w-full">
          <div className="font-medium mb-2">Status Overview</div>
          <div className="flex flex-wrap gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="font-medium">{stats.byStatus.inUse}</span>
              <span className="text-muted-foreground text-xs">In Use</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span className="font-medium">{stats.byStatus.inStock}</span>
              <span className="text-muted-foreground text-xs">In Stock</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
              <span className="font-medium">{stats.byStatus.needsRepair}</span>
              <span className="text-muted-foreground text-xs">Needs Repair</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              <span className="font-medium">{stats.byStatus.underRepair}</span>
              <span className="text-muted-foreground text-xs">Under Repair</span>
            </span>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
