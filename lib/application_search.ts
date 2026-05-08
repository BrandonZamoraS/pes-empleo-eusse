export function buildApplicationSearchFilter(search: string, jobIds: number[] = []) {
  const trimmedSearch = search.trim();

  if (!trimmedSearch) {
    return '';
  }

  const term = `%${trimmedSearch}%`;
  const filters = [
    `applicant_full_name.ilike.${term}`,
    `applicant_id_number.ilike.${term}`,
    `applicant_phone.ilike.${term}`,
  ];
  const uniqueJobIds = Array.from(new Set(jobIds)).filter(Number.isFinite);

  if (uniqueJobIds.length > 0) {
    filters.push(`job_id.in.(${uniqueJobIds.join(',')})`);
  }

  return filters.join(',');
}
