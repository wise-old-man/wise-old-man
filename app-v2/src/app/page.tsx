import { Button } from "~/components/Button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "~/components/Dropdown";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "~/components/Select";

import PlusIcon from "~/assets/plus.svg";
import CheckIcon from "~/assets/check.svg";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/Tabs";
import {
  ToggleTabs,
  ToggleTabsContent,
  ToggleTabsList,
  ToggleTabsTrigger,
} from "~/components/ToggleTabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/Tooltip";
import { Switch } from "~/components/Switch";
import { Label } from "~/components/Label";

const NAMES = [
  "Amya Ware",
  "Giada Knox",
  "Bethany Shah",
  "Ty Hughes",
  "Alejandro Charles",
  "Kylee Curtis",
  "Taylor Henderson",
  "Alissa Gonzalez",
  "Jordan Underwood",
  "Adyson Alexander",
  "Carter Chung",
  "Ariana Gross",
  "Xiomara Harrison",
  "Madilyn Tran",
  "Jewel Colon",
  "Makenzie Wolfe",
  "Lyric Ryan",
  "Kassidy Pennington",
  "Adyson Floyd",
  "Kelton Cook",
  "Zain Weber",
  "Sage Rubio",
  "Chanel Wood",
  "Kody Ramsey",
  "Evelin Watson",
  "Ulises Landry",
  "Deangelo Richardson",
  "Erika Berg",
  "Cordell Gonzalez",
  "Yahir Carter",
  "Kason Flynn",
  "Reina Lewis",
  "Katrina Buckley",
  "Rubi Ward",
  "Jayla Boyd",
  "Averi Brady",
  "Esmeralda Wiggins",
  "Ari Patel",
  "Donavan Bird",
  "Damaris Bridges",
  "Blake Dudley",
  "Janiya Collier",
  "Nayeli Scott",
  "Bruce Black",
  "Amari Patton",
  "Tiara Randall",
  "Sergio Lopez",
  "Magdalena Morales",
  "Karsyn Li",
  "Marlee Mcguire",
  "Oswaldo Carrillo",
  "Patrick Monroe",
  "Aaron Shaffer",
  "Callie Zuniga",
  "Jovanny Mcfarland",
  "Lee Small",
  "Oswaldo Sims",
  "Shaun Leblanc",
  "Nayeli Barajas",
  "Anabelle Flowers",
  "Angela Beasley",
  "Walter Atkinson",
  "Jair Romero",
  "Kailyn Robles",
  "Emmalee Good",
  "Lilly Newman",
  "Athena Vaughan",
  "Miguel Lambert",
  "Ellie Rollins",
  "Quintin Watts",
  "Eden Leonard",
  "Reyna York",
  "Madilyn Barrett",
  "George Chambers",
  "Alejandro Hopkins",
  "Madelynn Cook",
  "Timothy Stephens",
  "Victoria Ochoa",
  "Paula Cross",
  "Isabela Taylor",
  "Dominique Shah",
  "Adrienne Wilkerson",
  "Derick Henderson",
  "Aubrie Hendrix",
  "Litzy Bradley",
  "Ciara Frazier",
  "Ahmed Hudson",
  "Nathen Gross",
  "Freddy Hicks",
  "River Orr",
  "Joe Caldwell",
  "Terrance Alvarez",
  "Kinley Patel",
  "Kobe Johnson",
  "Isabell Cruz",
  "Kathy Bernard",
  "Samuel Keith",
  "Micaela Gibson",
  "Connor Goodwin",
  "Rosemary Combs",
  "Maggie Dillon",
  "Madalyn Merritt",
  "Simone Perez",
  "Amelia Fuller",
  "Cheyanne Garner",
  "Francesca Fritz",
  "Kaylyn Fuller",
  "Shaun Williams",
  "Isiah Jackson",
  "Jayson Hester",
  "Vaughn Weber",
  "Magdalena Abbott",
  "Haylie Farrell",
  "Makayla Sullivan",
  "Aliana Boyle",
  "Erick Frey",
  "Maddox Crawford",
  "Cassius Potter",
  "Sierra Massey",
  "Coleman Mcguire",
];

const METRICS = [
  "hitpoints",
  "defence",
  "magic",
  "prayer",
  "ranged",
  "woodcutting",
  "firemaking",
  "mining",
  "smithing",
  "agility",
  "slayer",
  "hunter",
  "crafting",
  "fletching",
  "fishing",
  "cooking",
];

export default function Home() {
  return (
    <div className="flex flex-col gap-y-7 p-20">
      <div className="flex gap-x-4">
        <Button variant="blue">Update</Button>
        <Button>Cancel</Button>
      </div>
      <div className="flex gap-x-4">
        <Button variant="blue">
          Update
          <PlusIcon className="-mr-2 h-5 w-5 animate-spin" />
        </Button>
        <Button>
          <PlusIcon className="-ml-2 h-5 w-5" />
          Cancel
        </Button>
      </div>
      <div className="flex gap-x-4">
        <Button size="sm" variant="blue">
          Update
        </Button>
        <Button size="sm">Update</Button>
      </div>

      <div>
        <Select>
          <SelectTrigger className="w-[14rem]">
            <SelectValue placeholder="Select a person..." />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup className="relative">
              <SelectLabel>People</SelectLabel>
              <SelectSeparator />
              {NAMES.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Select>
          <SelectTrigger className="w-[12rem]">
            <SelectValue placeholder="Select a metric..." />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup className="relative">
              {METRICS.map((metric) => (
                <SelectItem key={metric} value={metric}>
                  <div className="flex items-center gap-x-2">
                    <img src={`https://wiseoldman.net/img/runescape/icons_small/${metric}.png`} />
                    {metric}
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild className="focus:outline-none">
            <Button iconButton>
              <PlusIcon className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Actions for Psikoi</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <PlusIcon className="mr-2 h-4 w-4" />
              Open hiscores
            </DropdownMenuItem>
            <DropdownMenuItem>
              <CheckIcon className="mr-2 h-4 w-4" />
              Submit name change
            </DropdownMenuItem>
            <DropdownMenuItem>
              <CheckIcon className="mr-2 h-4 w-4" />
              Reassign game type
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div>
        <Tabs defaultValue="ho">
          <TabsList>
            <TabsTrigger value="hey">Overview</TabsTrigger>
            <TabsTrigger value="ho">Gained</TabsTrigger>
            <TabsTrigger value="123">Groups</TabsTrigger>
            <TabsTrigger value="123fff">Competitions</TabsTrigger>
          </TabsList>
          <TabsContent value="hey">HEEEYYY!!</TabsContent>
          <TabsContent value="ho">Hoooo!!</TabsContent>
        </Tabs>
      </div>

      <div>
        <ToggleTabs defaultValue="ho">
          <ToggleTabsList>
            <ToggleTabsTrigger value="hey">Skills</ToggleTabsTrigger>
            <ToggleTabsTrigger value="ho">Bosses</ToggleTabsTrigger>
            <ToggleTabsTrigger value="123">Activities</ToggleTabsTrigger>
          </ToggleTabsList>
          <ToggleTabsContent value="hey">HEEEYYY!!</ToggleTabsContent>
          <ToggleTabsContent value="ho">Hoooo!!</ToggleTabsContent>
        </ToggleTabs>
      </div>

      <div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button>Tooltip!</Button>
          </TooltipTrigger>
          <TooltipContent align="start">
            Magna aliqua ea dolore eu minim. Nisi sunt excepteur ea elit aute dolore nisi commodo sunt
            sint reprehenderit fugiat dolore aliqua.
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="flex items-center space-x-2">
        <Switch id="airplane-mode" />
        <Label htmlFor="airplane-mode">Airplane Mode</Label>
      </div>
    </div>
  );
}
