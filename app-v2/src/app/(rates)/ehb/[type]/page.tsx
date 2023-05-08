import Image from "next/image";
import {
  Boss,
  EfficiencyAlgorithmType,
  EfficiencyAlgorithmTypeUnion,
  MetricProps,
} from "@wise-old-man/utils";
import { apiClient } from "~/utils/api";

interface PageProps {
  params: {
    type: EfficiencyAlgorithmTypeUnion;
  };
}

export async function generateStaticParams() {
  const types = Object.values(EfficiencyAlgorithmType);

  return types.map((type) => ({ params: { type } }));
}

export default async function EHBRatesPage({ params }: PageProps) {
  const data = await apiClient.efficiency.getEHBRates(params.type);

  return (
    <ul className="mt-6 flex flex-col gap-y-3">
      {data.length === 0 ? (
        <div className="w-full rounded border border-gray-700 py-10 text-center text-sm text-gray-300">
          There are no EHB rates for this account type.
        </div>
      ) : (
        <>
          {data.map((entry) => (
            <li
              key={entry.boss}
              className="flex items-center justify-between rounded-lg border border-gray-600 p-5"
            >
              <div className="flex items-center">
                <BossIcon boss={entry.boss} />
                <span className="ml-3 text-xs font-medium text-white sm:text-sm">
                  {MetricProps[entry.boss].name}
                </span>
              </div>
              <span className="text-xs text-gray-200 sm:text-sm">{entry.rate} kills per hour</span>
            </li>
          ))}
        </>
      )}
    </ul>
  );
}

function BossIcon(props: { boss: Boss }) {
  const { boss } = props;
  return <Image height={24} width={24} alt={boss} src={`/img/metrics/${boss}.png`} />;
}
