import dynamic from "next/dynamic";

import {
  ACTIVITIES,
  BOSSES,
  MetricProps,
  PLAYER_TYPES,
  PlayerTypeProps,
  SKILLS,
} from "@wise-old-man/utils";
import { Button } from "~/components/Button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/Dropdown";

import CheckIcon from "~/assets/check.svg";
import ChevronDownIcon from "~/assets/chevron_down.svg";
import LoadingIcon from "~/assets/loading.svg";
import PlusIcon from "~/assets/plus.svg";
import SearchIcon from "~/assets/search.svg";
import WarningIcon from "~/assets/warning.svg";

import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "~/components/Alert";
import { Badge } from "~/components/Badge";
import { DatePicker } from "~/components/DatePicker";
import { Input } from "~/components/Input";
import { Label } from "~/components/Label";
import { ListTable, ListTableCell, ListTableRow } from "~/components/ListTable";
import { Switch } from "~/components/Switch";
import { Tabs, TabsList, TabsTrigger } from "~/components/Tabs";
import { ToggleTabs, ToggleTabsList, ToggleTabsTrigger } from "~/components/ToggleTabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/Tooltip";
import { Container } from "~/components/Container";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemGroup,
  ComboboxItemsContainer,
  ComboboxSeparator,
  ComboboxTrigger,
} from "~/components/Combobox";

const BarChartSSR = dynamic(() => import("../components/BarChart"), {
  ssr: false,
  loading: () => <div className="aspect-video w-full bg-transparent" />,
});

const LineChartSSR = dynamic(() => import("../components/LineChart"), {
  ssr: false,
  loading: () => <div className="aspect-video w-full bg-transparent" />,
});

const DATA_A = {
  name: "Psikoi",
  data: [
    { time: 1681649147024, value: 122875 },
    { time: 1681748825702, value: 130163 },
    { time: 1681816268407, value: 158934 },
    { time: 1681920682461, value: 189094 },
    { time: 1682171203920, value: 189094 },
    { time: 1682221310566, value: 268309 },
    { time: 1682232930454, value: 278474 },
    { time: 1682301763846, value: 278474 },
    { time: 1682304374888, value: 267564 },
    { time: 1682330297922, value: 317267 },
    { time: 1682331743741, value: 346320 },
  ],
};

const DATA_B = {
  name: "rro",
  data: [
    { time: 1681807226141, value: 2 * 37475 },
    { time: 1681874287242, value: 2 * 41345 },
    { time: 1681934452595, value: 2 * 51375 },
    { time: 1681987520257, value: 2 * 57046 },
    { time: 1682027871417, value: 2 * 68700 },
    { time: 1682057437313, value: 2 * 71050 },
    { time: 1682153718429, value: 2 * 120100 },
    { time: 1682216617781, value: 2 * 120100 },
    { time: 1682235028775, value: 2 * 136100 },
    { time: 1682266836442, value: 2 * 178100 },
    { time: 1682301362784, value: 2 * 178100 },
    { time: 1682333071001, value: 2 * 218100 },
  ],
};

export default function Home() {
  return (
    <Container className="flex flex-col gap-y-10">
      <Link href="/leaderboards/top">Go to leaderboards </Link>
      <div className="max-w-xl border border-gray-500 p-5">
        <LineChartSSR datasets={[DATA_A, DATA_B]} showLegend />
      </div>
      <div className="max-w-xl border border-gray-500 p-5">
        <BarChartSSR
          name="Experience"
          data={[
            { date: new Date("2023-04-23T12:07:04.464Z"), value: 0 },
            { date: new Date("2023-04-22T12:07:04.464Z"), value: 10 * 282087 },
            { date: new Date("2023-04-21T12:07:04.464Z"), value: 10 * 20206 },
            { date: new Date("2023-04-20T12:07:04.464Z"), value: 10 * 357552 },
            { date: new Date("2023-04-19T12:07:04.464Z"), value: 10 * 363373 },
            { date: new Date("2023-04-18T12:07:04.464Z"), value: 10 * 101489 },
            { date: new Date("2023-04-17T12:07:04.464Z"), value: 10 * 636910 },
          ]}
        />
      </div>
      <div className="max-w-sm">
        <ListTable>
          <ListTableRow>
            <ListTableCell className="w-1 pr-1">1</ListTableCell>
            <ListTableCell className="text-sm text-white">
              <Link href="/psikoi" className="hover:underline">
                <div className="flex items-center gap-x-3">
                  <div className="h-8 w-8 rounded-full bg-gray-600" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Psikoi</span>
                    <span className="text-xs text-gray-200">Updated 2 days ago</span>
                  </div>
                </div>
              </Link>
            </ListTableCell>
            <ListTableCell className="w-5 text-right font-medium tabular-nums text-green-400">
              +3765k
            </ListTableCell>
          </ListTableRow>
          <ListTableRow>
            <ListTableCell className="w-1 pr-1">2</ListTableCell>
            <ListTableCell className="text-sm text-white">Jaketserwars</ListTableCell>
            <ListTableCell className="w-5 text-right font-medium tabular-nums text-green-400">
              +598k
            </ListTableCell>
          </ListTableRow>
          <ListTableRow>
            <ListTableCell className="w-1 pr-1">3</ListTableCell>
            <ListTableCell className="text-sm text-white">Boom</ListTableCell>
            <ListTableCell className="w-5 text-right font-medium tabular-nums text-green-400">
              +485k
            </ListTableCell>
          </ListTableRow>
        </ListTable>
      </div>
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
        <Combobox>
          <ComboboxTrigger asChild>
            <Button variant="blue">Open select menu</Button>
          </ComboboxTrigger>
          <ComboboxContent>
            <ComboboxItemsContainer>
              <ComboboxItemGroup label="Skills">
                {SKILLS.map((skill) => (
                  <ComboboxItem key={skill} value={skill}>
                    <img src={`/img/metrics_small/${skill}.png`} />
                    {MetricProps[skill].name}
                  </ComboboxItem>
                ))}
              </ComboboxItemGroup>
              <ComboboxSeparator />
              <ComboboxItemGroup label="Bosses">
                {BOSSES.map((boss) => (
                  <ComboboxItem key={boss} value={boss}>
                    <img src={`/img/metrics_small/${boss}.png`} />
                    {MetricProps[boss].name}
                  </ComboboxItem>
                ))}
              </ComboboxItemGroup>
              <ComboboxSeparator />
              <ComboboxItemGroup label="Activities">
                {ACTIVITIES.map((activity) => (
                  <ComboboxItem key={activity} value={activity}>
                    <img src={`/img/metrics_small/${activity}.png`} />
                    {MetricProps[activity].name}
                  </ComboboxItem>
                ))}
              </ComboboxItemGroup>
            </ComboboxItemsContainer>
          </ComboboxContent>
        </Combobox>
      </div>
      <div>
        <Combobox>
          <ComboboxTrigger asChild>
            <Button variant="blue">Open Combobox menu</Button>
          </ComboboxTrigger>
          <ComboboxContent>
            <ComboboxInput placeholder="Search metrics..." />
            <ComboboxEmpty>No results were found</ComboboxEmpty>
            <ComboboxItemsContainer>
              <ComboboxItemGroup label="Skills">
                {SKILLS.map((skill) => (
                  <ComboboxItem key={skill} value={skill}>
                    <img src={`/img/metrics_small/${skill}.png`} />
                    {MetricProps[skill].name}
                  </ComboboxItem>
                ))}
              </ComboboxItemGroup>
              <ComboboxSeparator />
              <ComboboxItemGroup label="Bosses">
                {BOSSES.map((boss) => (
                  <ComboboxItem key={boss} value={boss}>
                    <img src={`/img/metrics_small/${boss}.png`} />
                    {MetricProps[boss].name}
                  </ComboboxItem>
                ))}
              </ComboboxItemGroup>
              <ComboboxSeparator />
              <ComboboxItemGroup label="Activities">
                {ACTIVITIES.map((activity) => (
                  <ComboboxItem key={activity} value={activity}>
                    <img src={`/img/metrics_small/${activity}.png`} />
                    {MetricProps[activity].name}
                  </ComboboxItem>
                ))}
              </ComboboxItemGroup>
            </ComboboxItemsContainer>
          </ComboboxContent>
        </Combobox>
      </div>
      <div>
        <Combobox>
          <ComboboxTrigger asChild>
            <Button className="w-auto font-normal text-gray-100">
              Select player type...
              <ChevronDownIcon className="ml-5 h-4 w-4" />
            </Button>
          </ComboboxTrigger>
          <ComboboxContent>
            <ComboboxItemsContainer>
              <ComboboxItemGroup label="Player Type">
                {PLAYER_TYPES.map((playerType) => (
                  <ComboboxItem key={playerType} value={playerType}>
                    <img src={`/img/player_types/${playerType}.png`} />
                    {PlayerTypeProps[playerType].name}
                  </ComboboxItem>
                ))}
              </ComboboxItemGroup>
            </ComboboxItemsContainer>
          </ComboboxContent>
        </Combobox>
      </div>
      <div className="h-80 w-full" />
      Home!
    </Container>
  );
}
