import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Profile() {
  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>

        </DropdownMenuTrigger>
        <DropdownMenuContent>
            <DropdownMenuLabel>Nguyen Huu Toan</DropdownMenuLabel>
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
