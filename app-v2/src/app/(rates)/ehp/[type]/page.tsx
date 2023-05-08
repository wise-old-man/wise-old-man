import Image from "next/image";
import {
  EfficiencyAlgorithmType,
  EfficiencyAlgorithmTypeUnion,
  MAX_SKILL_EXP,
  MetricProps,
  Skill,
  SkillMetaConfig,
  SkillMetaMethod,
} from "@wise-old-man/utils";
import { apiClient } from "~/utils/api";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableColumns,
  TableContainer,
  TableHeader,
  TableRow,
} from "~/components/Table";
import { Label } from "~/components/Label";
import { FormattedNumber } from "~/components/FormattedNumber";

interface PageProps {
  params: {
    type: EfficiencyAlgorithmTypeUnion;
  };
}

export async function generateStaticParams() {
  const types = Object.values(EfficiencyAlgorithmType);
  return types.map((type) => ({ params: { type } }));
}

export default async function EHPRatesPage({ params }: PageProps) {
  const data = await apiClient.efficiency.getEHPRates(params.type);

  return (
    <div className="mt-10 flex gap-x-12">
      <div className="grow space-y-24">
        {data.map((config) => (
          <div key={config.skill} id={config.skill} className="flex scroll-mt-28 flex-col gap-y-7">
            <div className="group flex items-center">
              <SkillIcon skill={config.skill} />
              <h3 className="mx-3 text-h3 font-medium">{MetricProps[config.skill].name}</h3>
              <a
                href={`#${config.skill}`}
                className="invisible text-xl text-gray-200 group-hover:visible"
              >
                #
              </a>
            </div>
            <ExpRatesTable methods={config.methods} />
            {!!config.bonuses && config.bonuses.length > 0 && <BonusesTable bonuses={config.bonuses} />}
          </div>
        ))}
      </div>
      <QuickLinksPanel skills={data.map((d) => d.skill)} />
    </div>
  );
}

function MethodRate(props: SkillMetaMethod) {
  if (props.rate === 0) return <>---</>;

  if (props.realRate) {
    return (
      <div>
        <span>
          <FormattedNumber value={props.rate} />
          &nbsp;per hour
        </span>
        <span>
          &nbsp;(actually&nbsp;
          <FormattedNumber value={props.realRate} />)
        </span>
      </div>
    );
  }

  return (
    <>
      <FormattedNumber value={props.rate} />
      &nbsp;per hour
    </>
  );
}

function BonusesTable(props: { bonuses: SkillMetaConfig["bonuses"] }) {
  const { bonuses } = props;

  return (
    <TableContainer>
      <TableHeader>
        <span className="text-base font-medium">Bonuses</span>
      </TableHeader>
      <Table>
        <TableColumns>
          <TableColumn>Starting exp.</TableColumn>
          <TableColumn>Ending exp.</TableColumn>
          <TableColumn>Skill</TableColumn>
          <TableColumn>Bonus ratio</TableColumn>
          <TableColumn>Bonus exp.</TableColumn>
        </TableColumns>
        <TableBody>
          {bonuses.map((bonus) => (
            <TableRow key={`${bonus.startExp}_${bonus.endExp}_${bonus.bonusSkill}_${bonus.ratio}`}>
              <TableCell>
                <FormattedNumber value={bonus.startExp} />
              </TableCell>
              <TableCell>
                <FormattedNumber value={bonus.endExp} />
              </TableCell>
              <TableCell className="flex items-center gap-x-2">
                <SkillIconSmall skill={bonus.bonusSkill} />
                <span>{MetricProps[bonus.bonusSkill].name}</span>
              </TableCell>
              <TableCell>{Math.floor(bonus.ratio * 10000) / 10000}</TableCell>
              <TableCell>
                {bonus.maxBonus ? (
                  <>
                    <FormattedNumber value={bonus.maxBonus} />
                    &nbsp;(max)
                  </>
                ) : (
                  <FormattedNumber
                    value={Math.min(
                      MAX_SKILL_EXP,
                      Math.floor((bonus.endExp - bonus.startExp) * bonus.ratio)
                    )}
                  />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function ExpRatesTable(props: { methods: SkillMetaMethod[] }) {
  const { methods } = props;

  return (
    <TableContainer>
      <TableHeader>
        <span className="text-base font-medium">Experience rates</span>
      </TableHeader>
      <Table>
        <TableColumns>
          <TableColumn>Starting exp.</TableColumn>
          <TableColumn>Ending exp.</TableColumn>
          <TableColumn>Rate</TableColumn>
          <TableColumn>Estimated duration</TableColumn>
          <TableColumn>Description</TableColumn>
        </TableColumns>
        <TableBody>
          {methods.map((method, i) => {
            const { startExp, rate, description } = method;
            const endExp = i < methods.length - 1 ? methods[i + 1].startExp : MAX_SKILL_EXP;
            const duration = (endExp - startExp) / rate;

            return (
              <TableRow key={`${startExp}_${rate}_${description}`}>
                <TableCell>
                  <FormattedNumber value={startExp} />
                </TableCell>
                <TableCell>
                  <FormattedNumber value={endExp} />
                </TableCell>
                <TableCell>
                  <MethodRate {...method} />
                </TableCell>
                <TableCell>{Math.floor(duration * 100) / 100} hours</TableCell>
                <TableCell>{description}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function QuickLinksPanel(props: { skills: Skill[] }) {
  return (
    <div className="h-100 w-full max-w-[12rem]">
      <ul className="custom-scroll sticky top-28 mt-[3.25rem] flex max-h-[calc(100vh-8rem)] w-full flex-col gap-y-2.5 overflow-y-auto rounded-lg border border-gray-500 p-5">
        <Label className="pb-2 text-white">Quick links</Label>
        {props.skills.map((skill) => (
          <li key={skill}>
            <a
              href={`#${skill}`}
              className="flex items-center gap-x-2 text-gray-200 hover:text-white hover:underline"
            >
              <SkillIconSmall skill={skill} />
              <span className="text-sm">{MetricProps[skill].name}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SkillIcon(props: { skill: Skill }) {
  const { skill } = props;
  return <Image height={24} width={24} alt={skill} src={`/img/metrics/${skill}.png`} />;
}

function SkillIconSmall(props: { skill: Skill }) {
  const { skill } = props;
  return <Image height={16} width={16} alt={skill} src={`/img/metrics_small/${skill}.png`} />;
}
