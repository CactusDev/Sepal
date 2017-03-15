
import { BasePacket } from "../packet";

export interface AuthenticationPacket extends BasePacket {
    authkey?: string;
}

export class AuthenticationHandler {

    authenticate(packet: AuthenticationPacket): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {

        });
    }
}
