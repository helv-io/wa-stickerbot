export default interface baileysClient {
  getOrderDetails: (
    orderId: string,
    tokenBase64: string
  ) => Promise<import('@adiwajshing/baileys/lib/Types').OrderDetails>
  getCatalog: ({
    jid,
    limit,
    cursor
  }: import('@adiwajshing/baileys/lib/Types').GetCatalogOptions) => Promise<{
    products: import('@adiwajshing/baileys/lib/Types').Product[]
    nextPageCursor: string | undefined
  }>
  getCollections: (
    jid?: string | undefined,
    limit?: number
  ) => Promise<{
    collections: import('@adiwajshing/baileys/lib/Types').CatalogCollection[]
  }>
  productCreate: (
    create: import('@adiwajshing/baileys/lib/Types').ProductCreate
  ) => Promise<import('@adiwajshing/baileys/lib/Types').Product>
  productDelete: (productIds: string[]) => Promise<{
    deleted: number
  }>
  productUpdate: (
    productId: string,
    update: import('@adiwajshing/baileys/lib/Types').ProductUpdate
  ) => Promise<import('@adiwajshing/baileys/lib/Types').Product>
  sendMessageAck: ({
    tag,
    attrs
  }: import('@adiwajshing/baileys').BinaryNode) => Promise<void>
  sendRetryRequest: (
    node: import('@adiwajshing/baileys').BinaryNode,
    forceIncludeKeys?: boolean
  ) => Promise<void>
  rejectCall: (callId: string, callFrom: string) => Promise<void>
  getPrivacyTokens: (
    jids: string[]
  ) => Promise<import('@adiwajshing/baileys').BinaryNode>
  assertSessions: (jids: string[], force: boolean) => Promise<boolean>
  relayMessage: (
    jid: string,
    message: import('@adiwajshing/baileys/lib/Types').WAProto.IMessage,
    {
      messageId,
      participant,
      additionalAttributes,
      useUserDevicesCache,
      cachedGroupMetadata
    }: import('@adiwajshing/baileys/lib/Types').MessageRelayOptions
  ) => Promise<string>
  sendReceipt: (
    jid: string,
    participant: string | undefined,
    messageIds: string[],
    type: import('@adiwajshing/baileys/lib/Types').MessageReceiptType
  ) => Promise<void>
  sendReceipts: (
    keys: import('@adiwajshing/baileys/lib/Types').WAProto.IMessageKey[],
    type: import('@adiwajshing/baileys/lib/Types').MessageReceiptType
  ) => Promise<void>
  readMessages: (
    keys: import('@adiwajshing/baileys/lib/Types').WAProto.IMessageKey[]
  ) => Promise<void>
  refreshMediaConn: (
    forceGet?: boolean
  ) => Promise<import('@adiwajshing/baileys/lib/Types').MediaConnInfo>
  waUploadToServer: import('@adiwajshing/baileys/lib/Types').WAMediaUploadFunction
  fetchPrivacySettings: (force?: boolean) => Promise<{
    [_: string]: string
  }>
  updateMediaMessage: (
    message: import('@adiwajshing/baileys/lib/Types').WAProto.IWebMessageInfo
  ) => Promise<import('@adiwajshing/baileys/lib/Types').WAProto.IWebMessageInfo>
  sendMessage: (
    jid: string,
    content: import('@adiwajshing/baileys/lib/Types').AnyMessageContent,
    options?: import('@adiwajshing/baileys/lib/Types').MiscMessageGenerationOptions
  ) => Promise<
    import('@adiwajshing/baileys/lib/Types').WAProto.WebMessageInfo | undefined
  >
  groupMetadata: (
    jid: string
  ) => Promise<import('@adiwajshing/baileys/lib/Types').GroupMetadata>
  groupCreate: (
    subject: string,
    participants: string[]
  ) => Promise<import('@adiwajshing/baileys/lib/Types').GroupMetadata>
  groupLeave: (id: string) => Promise<void>
  groupUpdateSubject: (jid: string, subject: string) => Promise<void>
  groupParticipantsUpdate: (
    jid: string,
    participants: string[],
    action: import('@adiwajshing/baileys/lib/Types').ParticipantAction
  ) => Promise<
    {
      status: string
      jid: string
    }[]
  >
  groupUpdateDescription: (
    jid: string,
    description?: string | undefined
  ) => Promise<void>
  groupInviteCode: (jid: string) => Promise<string | undefined>
  groupRevokeInvite: (jid: string) => Promise<string | undefined>
  groupAcceptInvite: (code: string) => Promise<string | undefined>
  groupAcceptInviteV4: (
    key: string | import('@adiwajshing/baileys/lib/Types').WAProto.IMessageKey,
    inviteMessage: import('@adiwajshing/baileys/lib/Types').WAProto.Message.IGroupInviteMessage
  ) => Promise<string>
  groupGetInviteInfo: (
    code: string
  ) => Promise<import('@adiwajshing/baileys/lib/Types').GroupMetadata>
  groupToggleEphemeral: (
    jid: string,
    ephemeralExpiration: number
  ) => Promise<void>
  groupSettingUpdate: (
    jid: string,
    setting: 'announcement' | 'locked' | 'not_announcement' | 'unlocked'
  ) => Promise<void>
  groupFetchAllParticipating: () => Promise<{
    [_: string]: import('@adiwajshing/baileys/lib/Types').GroupMetadata
  }>
  processingMutex: {
    mutex<T>(code: () => T | Promise<T>): Promise<T>
  }
  upsertMessage: (
    msg: import('@adiwajshing/baileys/lib/Types').WAProto.IWebMessageInfo,
    type: import('@adiwajshing/baileys/lib/Types').MessageUpsertType
  ) => Promise<void>
  appPatch: (
    patchCreate: import('@adiwajshing/baileys/lib/Types').WAPatchCreate
  ) => Promise<void>
  sendPresenceUpdate: (
    type: import('@adiwajshing/baileys/lib/Types').WAPresence,
    toJid?: string | undefined
  ) => Promise<void>
  presenceSubscribe: (
    toJid: string,
    tcToken?: Buffer | undefined
  ) => Promise<void>
  profilePictureUrl: (
    jid: string,
    type?: 'image' | 'preview',
    timeoutMs?: number | undefined
  ) => Promise<string | undefined>
  onWhatsApp: (...jids: string[]) => Promise<
    {
      exists: boolean
      jid: string
    }[]
  >
  fetchBlocklist: () => Promise<string[]>
  fetchStatus: (jid: string) => Promise<
    | {
        status: string | undefined
        setAt: Date
      }
    | undefined
  >
  updateProfilePicture: (
    jid: string,
    content: import('@adiwajshing/baileys/lib/Types').WAMediaUpload
  ) => Promise<void>
  updateProfileStatus: (status: string) => Promise<void>
  updateProfileName: (name: string) => Promise<void>
  updateBlockStatus: (jid: string, action: 'block' | 'unblock') => Promise<void>
  getBusinessProfile: (
    jid: string
  ) => Promise<
    void | import('@adiwajshing/baileys/lib/Types').WABusinessProfile
  >
  resyncAppState: (
    collections: readonly (
      | 'critical_block'
      | 'critical_unblock_low'
      | 'regular_high'
      | 'regular_low'
      | 'regular'
    )[],
    isInitialSync: boolean
  ) => Promise<void>
  chatModify: (
    mod: import('@adiwajshing/baileys/lib/Types').ChatModification,
    jid: string
  ) => Promise<void>
  type: 'md'
  ws: import('ws')
  ev: import('@adiwajshing/baileys/lib/Types').BaileysEventEmitter & {
    process(
      handler: (
        events: Partial<
          import('@adiwajshing/baileys/lib/Types').BaileysEventMap
        >
      ) => void | Promise<void>
    ): () => void
    buffer(): void
    createBufferedFunction<A extends unknown[], T_1>(
      work: (...args: A) => Promise<T_1>
    ): (...args: A) => Promise<T_1>
    flush(force?: boolean | undefined): boolean
    isBuffering(): boolean
  }
  authState: {
    creds: import('@adiwajshing/baileys/lib/Types').AuthenticationCreds
    keys: import('@adiwajshing/baileys/lib/Types').SignalKeyStoreWithTransaction
  }
  user: import('@adiwajshing/baileys/lib/Types').Contact | undefined
  generateMessageTag: () => string
  query: (
    node: import('@adiwajshing/baileys').BinaryNode,
    timeoutMs?: number | undefined
  ) => Promise<import('@adiwajshing/baileys').BinaryNode>
  waitForMessage: (
    msgId: string,
    timeoutMs?: number | undefined
  ) => Promise<unknown>
  waitForSocketOpen: () => Promise<void>
  sendRawMessage: (data: Buffer | Uint8Array) => Promise<void>
  sendNode: (frame: import('@adiwajshing/baileys').BinaryNode) => Promise<void>
  logout: (msg?: string | undefined) => Promise<void>
  end: (error: Error | undefined) => void
  onUnexpectedError: (error: Error, msg: string) => void
  uploadPreKeys: (count?: number) => Promise<void>
  uploadPreKeysToServerIfRequired: () => Promise<void>
  waitForConnectionUpdate: (
    check: (
      u: Partial<import('@adiwajshing/baileys/lib/Types').ConnectionState>
    ) => boolean | undefined,
    timeoutMs?: number | undefined
  ) => Promise<void>
}
