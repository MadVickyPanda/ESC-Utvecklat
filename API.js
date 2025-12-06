const API_URL = "https://lernia-sjj-assignments.vercel.app/api/challenges";

export async function fetchChallenges() {
  const response = await fetch(API_URL);

  if (!response.ok) {
    const errorText = await response.text();
    const error = new Error(errorText || "Network response failed");
  }

  const data = await response.json();

  //console.loggar bara för eran skull om det är något ni vill se
  console.log(data.challenges);
  console.log(data);
  return data.challenges;
}
