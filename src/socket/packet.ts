
export interface PacketData {

}

export interface BasePacket {
	readonly type: string;
	readonly data: PacketData;
}

export interface PacketJoinChannelData extends PacketData {
	channel: string;
	identifier?: string;
}

export interface PacketJoinChannel extends BasePacket {
	data: PacketJoinChannelData;
}

export interface PacketLeaveChannelData extends PacketData {
	channel: string;
}

export interface PacketLeaveChannel extends BasePacket {
	data: PacketLeaveChannelData;
}
