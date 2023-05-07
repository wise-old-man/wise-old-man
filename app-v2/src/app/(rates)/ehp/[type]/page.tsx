import Image from "next/image";
import {
  EfficiencyAlgorithmType,
  EfficiencyAlgorithmTypeUnion,
  MAX_SKILL_EXP,
  MetricProps,
  Skill,
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

  return types.map((type) => ({
    params: { type },
  }));
}

export default async function EHPRatesPage({ params }: PageProps) {
  const data = await apiClient.efficiency.getEHPRates(params.type);

  return (
    <div className="mt-10 flex gap-x-12">
      <div className="grow space-y-24">
        {data.map((config) => (
          <div key={config.skill} id={config.skill} className="flex scroll-mt-28 flex-col gap-y-7">
            <div className="flex items-center">
              <SkillIcon skill={config.skill} />
              <h3 className="ml-3 text-h3 font-medium">{MetricProps[config.skill].name}</h3>
            </div>
            <TableContainer>
              <TableHeader>
                <span className="text-base font-medium">Experience rates</span>
              </TableHeader>
              <Table>
                <TableColumns>
                  <TableColumn>Starting exp.</TableColumn>
                  <TableColumn>Rate</TableColumn>
                  <TableColumn>Description</TableColumn>
                </TableColumns>
                <TableBody>
                  {config.methods.map((method) => (
                    <TableRow key={`${method.startExp}_${method.rate}_${method.description}`}>
                      <TableCell>
                        <FormattedNumber value={method.startExp} />
                      </TableCell>
                      <TableCell>
                        <MethodRate {...method} />
                      </TableCell>
                      <TableCell>{method.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {!!config.bonuses && config.bonuses.length > 0 && (
              <TableContainer>
                <TableHeader>
                  <span className="text-base font-medium">Bonuses</span>
                </TableHeader>
                <Table>
                  <TableColumns>
                    <TableColumn>Starting exp.</TableColumn>
                    <TableColumn>End exp.</TableColumn>
                    <TableColumn>Skill</TableColumn>
                    <TableColumn>Bonus ratio</TableColumn>
                    <TableColumn>Bonus exp.</TableColumn>
                  </TableColumns>
                  <TableBody>
                    {config.bonuses.map((bonus) => (
                      <TableRow
                        key={`${bonus.startExp}_${bonus.endExp}_${bonus.bonusSkill}_${bonus.ratio}`}
                      >
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
            )}
          </div>
        ))}
      </div>
      <div className="h-100 w-52">
        <ul className="custom-scroll sticky top-28 mt-[3.25rem] flex h-[calc(100vh-8rem)] w-full flex-col gap-y-2.5 overflow-y-auto rounded-lg border border-gray-500 p-5">
          <Label className="pb-2 text-white">Quick links</Label>
          {data.map((d) => (
            <li key={d.skill}>
              <a
                href={`#${d.skill}`}
                className="flex items-center gap-x-2 text-gray-200 hover:text-white hover:underline"
              >
                <SkillIconSmall skill={d.skill} />
                <span className="text-sm">{MetricProps[d.skill].name}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
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
