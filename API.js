const API_URL = "https://lernia-sjj-assignments.vercel.app/api/challenges";

export async function fetchChallenges() {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  const data = await response.json();

  //console.loggar bara för eran skull om det är något ni vill se
  console.log(data.challenges);
  console.log(data);
  // API:t returnerar { challenges: [...] }
  return data.challenges; // <-- returnerar arrayen direkt
}
