import { searchCompetitions } from "~/services/wiseoldman";
import { Pagination } from "~/components/Pagination";
import { CompetitionsList } from "~/components/competitions/CompetitionsList";
import {
  getCompetitionStatusParam,
  getCompetitionTypeParam,
  getMetricParam,
  getPageParam,
  getSearchParam,
} from "~/utils/params";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  searchParams: {
    page?: string;
    search?: string;
    type?: string;
    status?: string;
    metric?: string;
  };
}

export function generateMetadata(props: PageProps) {
  const { searchParams } = props;

  const page = getPageParam(searchParams.page) || 1;
  const search = getSearchParam(searchParams.search);

  if (search && search.length > 0) {
    return { title: `Competition search results for "${search}" (Page ${page})` };
  }

  return { title: `Competitions (Page ${page})` };
}

export default async function CompetitionsPage(props: PageProps) {
  const { searchParams } = props;

  const page = getPageParam(searchParams.page) || 1;
  const search = getSearchParam(searchParams.search);
  const metric = getMetricParam(searchParams.metric);
  const type = getCompetitionTypeParam(searchParams.type);
  const status = getCompetitionStatusParam(searchParams.status);

  const RESULTS_PER_PAGE = 20;

  const data = await searchCompetitions(
    search,
    metric,
    type,
    status,
    RESULTS_PER_PAGE,
    (page - 1) * RESULTS_PER_PAGE
  );

  return (
    <>
      {!data || data.length === 0 ? (
        <div className="w-full rounded border border-gray-700 py-10 text-center text-sm text-gray-200">
          No results were found
        </div>
      ) : (
        <CompetitionsList data={data} showHost />
      )}
      <div className="mt-4">
        <Pagination currentPage={page} hasMorePages={data.length >= RESULTS_PER_PAGE} />
      </div>
    </>
  );
}
