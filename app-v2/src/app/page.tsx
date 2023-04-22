import {
  SKILLS,
  BOSSES,
  ACTIVITIES,
  METRICS,
  MetricProps,
  PLAYER_TYPES,
  PlayerTypeProps,
} from "@wise-old-man/utils";
import { Button } from "~/components/Button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "~/components/Dropdown";

import PlusIcon from "~/assets/plus.svg";
import CheckIcon from "~/assets/check.svg";
import SearchIcon from "~/assets/search.svg";
import WarningIcon from "~/assets/warning.svg";
import LoadingIcon from "~/assets/loading.svg";
import ChevronDownIcon from "~/assets/chevron_down.svg";

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
import {
  SelectItemsContainer,
  Select,
  SelectContent,
  SelectEmpty,
  SelectInput,
  SelectItem,
  SelectItemGroup,
  SelectSeparator,
  SelectTrigger,
} from "~/components/Select";

import { Badge } from "~/components/Badge";
import { DatePicker } from "~/components/DatePicker";
import { Input } from "~/components/Input";
import { Alert, AlertDescription, AlertTitle } from "~/components/Alert";

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

export default function Home() {
  return (
    <div className="flex flex-col gap-y-10 p-20">
      <Alert className="flex items-center justify-between">
        <div>
          <AlertTitle>Migrating from TempleOSRS or CrystalMathLabs?</AlertTitle>
          <AlertDescription>
            You can add components and dependencies to your app using the cli.
          </AlertDescription>
        </div>
        <Button variant="blue">Migrate</Button>
      </Alert>
      <Alert variant="error">
        <WarningIcon className="h-5 w-5" />
        <AlertTitle>This player is flagged.</AlertTitle>
        <AlertDescription>
          Ea sit cillum cupidatat officia. Culpa laboris aute nisi fugiat esse adipisicing est ex veniam.
          Nisi Lorem veniam mollit ullamco consequat deserunt commodo. Tempor qui ex magna aute officia
          qui commodo dolor.
        </AlertDescription>
      </Alert>
      <Alert variant="success">
        <CheckIcon className="h-5 w-5" />
        <AlertTitle>Something wonderful just happened.</AlertTitle>
        <AlertDescription>
          Ea sit cillum cupidatat officia. Culpa laboris aute nisi fugiat esse.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-2 gap-5">
        <Input
          placeholder="Varrock Warriors"
          value="woah"
          autoFocus
          rightElement={<span className="text-xs text-gray-300">4/30</span>}
        />

        <Input
          placeholder="Varrock Warriors"
          leftElement={<SearchIcon className="h-5 w-5 text-gray-300" />}
        />

        <div className="flex flex-col">
          <Label className="mb-2 text-xs font-normal text-gray-200">Group Name</Label>
          <Input placeholder="Varrock Warriors" />
          <span className="mt-2 text-xs font-normal text-gray-200">Tip: Try doing this first</span>
        </div>

        <div className="flex flex-col">
          <Label className="mb-2 text-xs font-normal text-gray-200">Group Name</Label>
          <Input placeholder="Varrock Warriors" className="border-green-400" />
          <Label className="mt-2 text-xs font-normal text-green-400">Found 23 players</Label>
        </div>

        <div className="flex flex-col">
          <Label className="mb-2 text-xs font-normal text-gray-200">Group Name</Label>
          <Input placeholder="Varrock Warriors" className="border-red-400" />
          <Label className="mt-2 text-xs font-normal text-red-400">Failed to load URL</Label>
        </div>

        <div className="flex flex-col">
          <Label className="mb-2 text-xs font-normal text-gray-200">Homeworld</Label>
          <Input placeholder="450" type="number" />
        </div>

        <Input placeholder="Something" disabled value="Disabled with value" />
        <Input placeholder="Disabled (empty)" disabled />
      </div>

      <div className="flex max-w-sm gap-x-4">
        <DatePicker />
        <DatePicker />
      </div>

      <div className="flex gap-x-4">
        <Badge>Classic</Badge>
        <Badge>Team</Badge>
        <Badge variant="success">Top 0.1%</Badge>
        <Badge variant="outline">
          <CheckIcon className="-ml-1 mr-1 h-4 w-4 text-gray-100" />
          Hey!
        </Badge>
        <Badge variant="outline" className="border-yellow-500 text-yellow-500">
          Patreon Supporter
        </Badge>

        <Badge>Pending</Badge>
        <Badge variant="success">Approved</Badge>
        <Badge variant="error">Denied</Badge>
      </div>

      <div className="flex flex-col gap-y-3">
        <h1 className="text-h1 font-bold">H1 title</h1>
        <h2 className="text-h2 font-semibold">H2 subtitle</h2>
        <p className="max-w-prose text-body text-gray-200">
          Dolor occaecat id est qui non adipisicing reprehenderit nostrud est voluptate ad sint. Aute
          sint tempor ut adipisicing exercitation ullamco incididunt labore deserunt. Pariatur quis et
          aliqua ipsum sit laborum sunt ad. Elit velit reprehenderit proident cupidatat non excepteur
          nostrud eu pariatur consectetur non exercitation.
        </p>
      </div>

      <div className="flex gap-x-4">
        <Button variant="blue">Primary action</Button>
        <Button>Secondary action</Button>
        <Button iconButton>
          <PlusIcon className="h-5 w-5" />
        </Button>
      </div>
      <div className="flex gap-x-4">
        <Button disabled variant="blue">
          <LoadingIcon className="-ml-2 h-4 w-4 animate-spin" />
          Primary action
        </Button>
        <Button disabled>Secondary action</Button>
        <Button iconButton disabled>
          <PlusIcon className="h-5 w-5" />
        </Button>
      </div>
      <div className="flex gap-x-4">
        <Button size="sm" variant="blue">
          Primary small
        </Button>
        <Button size="sm">Secondary small</Button>
      </div>
      <div className="flex gap-x-4">
        <Button size="sm" disabled variant="blue">
          Primary small
        </Button>
        <Button size="sm" disabled>
          Secondary small
        </Button>
      </div>

      <div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild className="focus:outline-none">
            <Button>Dropdown Trigger</Button>
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
        </Tabs>
      </div>

      <div>
        <ToggleTabs>
          <ToggleTabsList>
            <ToggleTabsTrigger value="hey">Skills</ToggleTabsTrigger>
            <ToggleTabsTrigger value="ho">Bosses</ToggleTabsTrigger>
            <ToggleTabsTrigger value="123">Activities</ToggleTabsTrigger>
          </ToggleTabsList>
        </ToggleTabs>
      </div>

      <div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button>Tooltip trigger</Button>
          </TooltipTrigger>
          <TooltipContent align="start">
            Magna aliqua ea dolore eu minim. Nisi sunt excepteur ea elit aute dolore nisi commodo sunt
            sint reprehenderit fugiat dolore aliqua.
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="flex items-center space-x-2">
        <Switch id="replace_members" />
        <Label htmlFor="replace_members">Replace members</Label>
      </div>

      <div>
        <Select>
          <SelectTrigger asChild>
            <Button variant="blue">Open select menu</Button>
          </SelectTrigger>
          <SelectContent align="start">
            <SelectInput placeholder="Search metrics..." />
            <SelectEmpty>No results were found</SelectEmpty>
            <SelectItemsContainer>
              <SelectItemGroup label="Skills">
                {SKILLS.map((skill) => (
                  <SelectItem key={skill} value={skill}>
                    <img src={`https://wiseoldman.net/img/runescape/icons_small/${skill}.png`} />
                    {MetricProps[skill].name}
                  </SelectItem>
                ))}
              </SelectItemGroup>
              <SelectSeparator />
              <SelectItemGroup label="Bosses">
                {BOSSES.map((boss) => (
                  <SelectItem key={boss} value={boss}>
                    <img src={`https://wiseoldman.net/img/runescape/icons_small/${boss}.png`} />
                    {MetricProps[boss].name}
                  </SelectItem>
                ))}
              </SelectItemGroup>
              <SelectSeparator />
              <SelectItemGroup label="Activities">
                {ACTIVITIES.map((activity) => (
                  <SelectItem key={activity} value={activity}>
                    <img src={`https://wiseoldman.net/img/runescape/icons_small/${activity}.png`} />
                    {MetricProps[activity].name}
                  </SelectItem>
                ))}
              </SelectItemGroup>
            </SelectItemsContainer>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Select>
          <SelectTrigger asChild>
            <Button className="w-auto font-normal text-gray-100">
              Select player type...
              <ChevronDownIcon className="ml-5 h-4 w-4" />
            </Button>
          </SelectTrigger>
          <SelectContent>
            <SelectItemsContainer>
              <SelectItemGroup label="Player Type">
                {PLAYER_TYPES.map((playerType) => (
                  <SelectItem key={playerType} value={playerType}>
                    <img src={`https://wiseoldman.net/img/runescape/icons_small/${playerType}.png`} />
                    {PlayerTypeProps[playerType].name}
                  </SelectItem>
                ))}
              </SelectItemGroup>
            </SelectItemsContainer>
          </SelectContent>
        </Select>
      </div>

      <div className="h-[20rem] w-full" />
    </div>
  );
}
