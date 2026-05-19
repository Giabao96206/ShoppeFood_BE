const { Expo } = require('expo-server-sdk');

const expo = new Expo();

export const sendChatNotification = async (tokens: any, messageData: any) => {
  let messages = [];

  for (let pushToken of tokens) {
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Token không hợp lệ: ${pushToken}`);
      continue;
    }

    messages.push({
      to: pushToken,
      sound: 'default',
      
      data: {
        conversationId: messageData.conversation_id,
        avatar: messageData.avatar,
        content: messageData.content,
        name: messageData.name
      },
    });
  }

  let chunks = expo.chunkPushNotifications(messages);
  let tickets = [];

  for (let chunk of chunks) {
    try {
      let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    } catch (error) {
      console.error('Lỗi khi gửi push notification:', error);
    }
  }

  return tickets;
};