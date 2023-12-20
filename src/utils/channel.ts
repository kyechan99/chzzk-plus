export const getChannelIDByUrl = (url: string) => {
  const regex = /\/live\/([^/?]+)/;
  const match = url.match(regex);

  if (match && match.length >= 2) {
    const channelID = match[1];
    return channelID;
  }
  return "";
};
