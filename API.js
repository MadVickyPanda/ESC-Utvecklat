export async function fetchChallenges() {
  const response = await fetch(
    "https://lernia-sjj-assignments.vercel.app/api/challenges"
  );
  if (!response.ok) {
    throw new Error("Failed to fetch challenges");
  }
  const data = await response.json();
  return data;