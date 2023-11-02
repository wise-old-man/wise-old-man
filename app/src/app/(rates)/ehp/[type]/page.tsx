import {
  EfficiencyAlgorithmType,
  EfficiencyAlgorithmTypeUnion,
  MetricProps,
  Skill,
} from "@wise-old-man/utils";
import { apiClient } from "~/services/wiseoldman";
import { Label } from "~/components/Label";
import { MetricIcon, MetricIconSmall } from "~/components/Icon";
import { ExpRatesTable } from "~/components/rates/ExperienceRatesTable";
import { ExperienceBonusesTable } from "~/components/rates/ExperienceBonusesTable";

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
      <div className="w-full grow space-y-24">
        {data.map((config) => (
          <div key={config.skill} id={config.skill} className="flex scroll-mt-44 flex-col gap-y-7">
            <div className="group flex items-center">
              <MetricIcon metric={config.skill} />
              <h3 className="mx-3 text-h3 font-medium">{MetricProps[config.skill].name}</h3>
              <a
                href={`#${config.skill}`}
                className="invisible text-xl text-gray-200 group-hover:visible"
              >
                #
              </a>
            </div>
            <div className="custom-scroll overflow-x-auto">
              <ExpRatesTable methods={config.methods} />
            </div>
            {!!config.bonuses && config.bonuses.length > 0 && (
              <div className="custom-scroll overflow-x-auto">
                <ExperienceBonusesTable bonuses={config.bonuses} />
              </div>
            )}
          </div>
        ))}
      </div>
      <QuickLinksPanel skills={data.map((d) => d.skill)} />
    </div>
  );
}

function QuickLinksPanel(props: { skills: Skill[] }) {
  return (
    <div className="h-100 hidden w-full max-w-[12rem] lg:block">
      <ul className="custom-scroll sticky top-[6rem] mt-[3.25rem] flex max-h-[calc(100vh-8rem)] w-full flex-col gap-y-2.5 overflow-y-auto rounded-lg border border-gray-500 p-5">
        <Label className="pb-2 text-white">Quick links</Label>
        {props.skills.map((skill) => (
          <li key={skill}>
            <a
              href={`#${skill}`}
              className="flex items-center gap-x-2 text-gray-200 hover:text-white hover:underline"
            >
              <MetricIconSmall metric={skill} />
              <span className="text-sm">{MetricProps[skill].name}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
