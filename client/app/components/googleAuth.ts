export interface HandleGoogleParams {
  credential?: string;
  endpoint: string;
}

export const auth = {
  handleGoogle: async ({ credential, endpoint }: HandleGoogleParams) => {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          "Access-Control-Allow-Origin": "*",
          'Content-Type': 'application/json',
        },
        cache: 'no-cache',
        redirect: 'follow', 
        referrerPolicy: 'no-referrer',
        body: JSON.stringify({ credential }),
      });
      if (!response.ok) {
        console.log(response);
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error handling Google login:', error);
      return null;
    }
  },
};
