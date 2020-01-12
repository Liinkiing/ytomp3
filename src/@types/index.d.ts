export interface VideoInformations {
  title: string;
  url: string;
  thumbnail: {
    url: string;
    width: number;
    height: number;
  };
  artist: string | undefined;
}
