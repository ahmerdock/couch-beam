declare module "react-native-androidtv-remote" {
  export class AndroidRemote {
    constructor(host: string, options: Record<string, unknown>);
  }
  export const RemoteKeyCode: Record<string, number>;
  export const RemoteDirection: Record<string, number>;
}
