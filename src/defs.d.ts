
interface EmojiComponentData {
    standard: string
    alternatives: string[]
}

interface Component {
    type: "text" | "emoji" | "tag" | "url" | "variable"
    data: string | EmojiComponentData
}

interface TextComponent extends Component {
    type: "text"
    data: string
}

interface EmojiComponent extends Component {
    type: "emoji"
    data: EmojiComponentData
}

interface TagComponent extends Component {
    type: "tag"
    data: string
}

interface URLComponent extends Component {
    type: "url"
    data: string
}

interface CactusMessagePacket {
    type: "message"
    text: Component[]
    action: boolean
}

type Channel = string
type User = string
type Service = string

type Role = "banned" | "user" | "subscriber" | "moderator" | "owner"

interface CactusContext {
    packet: CactusMessagePacket
    channel: Channel
    user?: User
    role?: Role
    target?: User
    service: Service
}

interface ProxyMessage {
    type: "message"

    botInfo: {
        botId: number
        username: string
    }

    channel: string
    meta: any
    parts: string[]
    service: string
    source: string
}
