import { Language } from '@/types/chat';

type TranslationKey =
  | 'app.title'
  | 'status.online'
  | 'status.offline'
  | 'status.pending'
  | 'status.sent'
  | 'status.delivered'
  | 'status.read'
  | 'status.failed'
  | 'status.sending'
  | 'status.queued'
  | 'status.uploading'
  | 'action.retry'
  | 'action.send'
  | 'action.attach'
  | 'action.cancel'
  | 'action.login'
  | 'action.register'
  | 'action.logout'
  | 'action.forgotPassword'
  | 'action.resetPassword'
  | 'action.backToLogin'
  | 'action.createAccount'
  | 'action.call'
  | 'action.videoCall'
  | 'action.endCall'
  | 'action.mute'
  | 'action.unmute'
  | 'action.edit'
  | 'action.delete'
  | 'action.back'
  | 'action.search'
  | 'action.addUser'
  | 'action.startChat'
  | 'action.reply'
  | 'action.forward'
  | 'input.placeholder'
  | 'input.email'
  | 'input.password'
  | 'input.confirmPassword'
  | 'input.name'
  | 'input.search'
  | 'input.searchUsers'
  | 'error.uploadFailed'
  | 'error.unsupportedFile'
  | 'error.fileTooLarge'
  | 'error.sendFailed'
  | 'error.offline'
  | 'error.generic'
  | 'error.invalidCredentials'
  | 'error.emailExists'
  | 'error.weakPassword'
  | 'error.passwordMismatch'
  | 'error.emailNotFound'
  | 'error.cameraPermission'
  | 'error.microphonePermission'
  | 'file.image'
  | 'file.video'
  | 'file.audio'
  | 'file.document'
  | 'file.text'
  | 'queue.processing'
  | 'queue.itemsQueued'
  | 'network.online'
  | 'network.offline'
  | 'network.reconnecting'
  | 'conversations.title'
  | 'conversations.empty'
  | 'language.english'
  | 'language.spanish'
  | 'auth.welcome'
  | 'auth.loginTitle'
  | 'auth.registerTitle'
  | 'auth.forgotTitle'
  | 'auth.loginSubtitle'
  | 'auth.registerSubtitle'
  | 'auth.forgotSubtitle'
  | 'auth.noAccount'
  | 'auth.hasAccount'
  | 'auth.resetSent'
  | 'auth.resetSentDesc'
  | 'typing.indicator'
  | 'typing.multiple'
  | 'call.incoming'
  | 'call.outgoing'
  | 'call.connecting'
  | 'call.connected'
  | 'call.ended'
  | 'call.duration'
  | 'call.history'
  | 'call.missed'
  | 'call.completed'
  | 'call.declined'
  | 'call.noHistory'
  | 'message.edited'
  | 'message.deleted'
  | 'message.deleteConfirm'
  | 'message.forwarded'
  | 'upload.image'
  | 'upload.video'
  | 'upload.audio'
  | 'upload.file'
  | 'group.members'
  | 'group.create'
  | 'group.name'
  | 'group.namePlaceholder'
  | 'group.createButton'
  | 'group.minMembers'
  | 'users.available'
  | 'users.noResults'
  | 'tabs.chats'
  | 'tabs.calls'
  | 'tabs.users'
  | 'vanish.on'
  | 'vanish.off'
  | 'vanish.turnOff'
  | 'vanish.willDisappear'
  | 'viewOnce.label'
  | 'viewOnce.tapToView'
  | 'viewOnce.opened'
  | 'viewOnce.willDisappear'
  | 'reactions.title'
  | 'reactions.people'
  | 'voice.recording'
  | 'voice.send'
  | 'voice.cancel'
  | 'search.noResults'
  | 'search.results'
  | 'notification.enable'
  | 'notification.enableDesc'
  | 'notification.later'
  | 'pin.message'
  | 'pin.unpin'
  | 'readBy.title'
  | 'ai.title'
  | 'ai.placeholder'
  | 'theme.light'
  | 'theme.dark'
  | 'theme.system'
  | 'queue.pending'
  | 'queue.failed'
  | 'schedule.title'
  | 'schedule.quickOptions'
  | 'schedule.customTime'
  | 'schedule.inHour'
  | 'schedule.inHours'
  | 'schedule.tomorrowMorning'
  | 'schedule.tomorrowEvening'
  | 'schedule.scheduled'
  | 'schedule.cancelled'
  | 'forward.title'
  | 'forward.selectConversation';

type Translations = Record<TranslationKey, string>;

const translations: Record<Language, Translations> = {
  en: {
    'app.title': 'Chat',
    'status.online': 'Online',
    'status.offline': 'Offline',
    'status.pending': 'Sending...',
    'status.sent': 'Sent',
    'status.delivered': 'Delivered',
    'status.read': 'Read',
    'status.failed': 'Failed to send',
    'status.sending': 'Sending...',
    'status.queued': 'Queued',
    'status.uploading': 'Uploading...',
    'action.retry': 'Retry',
    'action.send': 'Send',
    'action.attach': 'Attach file',
    'action.cancel': 'Cancel',
    'action.login': 'Sign In',
    'action.register': 'Sign Up',
    'action.logout': 'Logout',
    'action.forgotPassword': 'Forgot Password?',
    'action.resetPassword': 'Reset Password',
    'action.backToLogin': 'Back to Login',
    'action.createAccount': 'Create Account',
    'action.call': 'Voice Call',
    'action.videoCall': 'Video Call',
    'action.endCall': 'End Call',
    'action.mute': 'Mute',
    'action.unmute': 'Unmute',
    'action.edit': 'Edit',
    'action.delete': 'Delete',
    'action.back': 'Back',
    'action.search': 'Search',
    'action.addUser': 'Add User',
    'action.startChat': 'Start Chat',
    'action.reply': 'Reply',
    'action.forward': 'Forward',
    'input.placeholder': 'Type a message...',
    'input.email': 'Email address',
    'input.password': 'Password',
    'input.confirmPassword': 'Confirm password',
    'input.name': 'Full name',
    'input.search': 'Search conversations...',
    'input.searchUsers': 'Search users...',
    'error.uploadFailed': 'Upload failed. Please try again.',
    'error.unsupportedFile': 'This file type is not supported.',
    'error.fileTooLarge': 'File is too large. Maximum size is 25MB.',
    'error.sendFailed': 'Failed to send message.',
    'error.offline': 'You are offline. Message will be sent when online.',
    'error.generic': 'Something went wrong. Please try again.',
    'error.invalidCredentials': 'Invalid email or password.',
    'error.emailExists': 'An account with this email already exists.',
    'error.weakPassword': 'Password must be at least 8 characters.',
    'error.passwordMismatch': 'Passwords do not match.',
    'error.emailNotFound': 'No account found with this email.',
    'error.cameraPermission': 'Camera access denied.',
    'error.microphonePermission': 'Microphone access denied.',
    'file.image': 'Image',
    'file.video': 'Video',
    'file.audio': 'Audio',
    'file.document': 'Document',
    'file.text': 'Text file',
    'queue.processing': 'Processing queued items...',
    'queue.itemsQueued': 'items queued',
    'network.online': 'You are back online',
    'network.offline': 'You are offline',
    'network.reconnecting': 'Reconnecting...',
    'conversations.title': 'Conversations',
    'conversations.empty': 'No conversations yet',
    'language.english': 'English',
    'language.spanish': 'Español',
    'auth.welcome': 'Welcome back',
    'auth.loginTitle': 'Sign in to your account',
    'auth.registerTitle': 'Create your account',
    'auth.forgotTitle': 'Reset your password',
    'auth.loginSubtitle': 'Enter your credentials to continue',
    'auth.registerSubtitle': 'Fill in your details to get started',
    'auth.forgotSubtitle': 'Enter your email to receive a reset link',
    'auth.noAccount': "Don't have an account?",
    'auth.hasAccount': 'Already have an account?',
    'auth.resetSent': 'Reset link sent!',
    'auth.resetSentDesc': 'Check your email for the password reset link.',
    'typing.indicator': 'is typing...',
    'typing.multiple': 'are typing...',
    'call.incoming': 'Incoming call',
    'call.outgoing': 'Calling...',
    'call.connecting': 'Connecting...',
    'call.connected': 'Connected',
    'call.ended': 'Call ended',
    'call.duration': 'Duration',
    'call.history': 'Recent Calls',
    'call.missed': 'Missed',
    'call.completed': 'Completed',
    'call.declined': 'Declined',
    'call.noHistory': 'No recent calls',
    'message.edited': 'edited',
    'message.deleted': 'This message was deleted',
    'message.deleteConfirm': 'Delete this message?',
    'message.forwarded': 'Forwarded',
    'upload.image': 'Image',
    'upload.video': 'Video',
    'upload.audio': 'Audio',
    'upload.file': 'File',
    'group.members': 'members',
    'group.create': 'Create Group',
    'group.name': 'Group Name',
    'group.namePlaceholder': 'Enter group name...',
    'group.createButton': 'Create',
    'group.minMembers': 'Select at least 2 members',
    'users.available': 'Available Users',
    'users.noResults': 'No users found',
    'tabs.chats': 'Chats',
    'tabs.calls': 'Calls',
    'tabs.users': 'Users',
    'vanish.on': 'Vanish',
    'vanish.off': 'Vanish Mode',
    'vanish.turnOff': 'Turn off vanish mode',
    'vanish.willDisappear': 'Message will disappear',
    'viewOnce.label': 'View once',
    'viewOnce.tapToView': 'Tap to view',
    'viewOnce.opened': 'Photo/Video opened',
    'viewOnce.willDisappear': 'This will disappear when closed',
    'reactions.title': 'Reactions',
    'reactions.people': 'people',
    'voice.recording': 'Recording',
    'voice.send': 'Send voice message',
    'voice.cancel': 'Cancel recording',
    'search.noResults': 'No messages found',
    'search.results': 'results',
    'notification.enable': 'Enable Notifications',
    'notification.enableDesc': 'Get notified when you receive new messages',
    'notification.later': 'Later',
    'pin.message': 'Pin message',
    'pin.unpin': 'Unpin message',
    'readBy.title': 'Read by',
    'ai.title': 'AI Assistant',
    'ai.placeholder': 'Ask me anything...',
    'theme.light': 'Light',
    'theme.dark': 'Dark',
    'theme.system': 'System',
    'queue.pending': 'pending',
    'queue.failed': 'failed',
    'schedule.title': 'Schedule Message',
    'schedule.quickOptions': 'Quick options',
    'schedule.customTime': 'Or pick a custom time',
    'schedule.inHour': 'In 1 hour',
    'schedule.inHours': 'In 3 hours',
    'schedule.tomorrowMorning': 'Tomorrow morning',
    'schedule.tomorrowEvening': 'Tomorrow evening',
    'schedule.scheduled': 'Message scheduled',
    'schedule.cancelled': 'Scheduled message cancelled',
    'forward.title': 'Forward Message',
    'forward.selectConversation': 'Select a conversation',
  },
  es: {
    'app.title': 'Chat',
    'status.online': 'En línea',
    'status.offline': 'Desconectado',
    'status.pending': 'Enviando...',
    'status.sent': 'Enviado',
    'status.delivered': 'Entregado',
    'status.read': 'Leído',
    'status.failed': 'Error al enviar',
    'status.sending': 'Enviando...',
    'status.queued': 'En cola',
    'status.uploading': 'Subiendo...',
    'action.retry': 'Reintentar',
    'action.send': 'Enviar',
    'action.attach': 'Adjuntar archivo',
    'action.cancel': 'Cancelar',
    'action.login': 'Iniciar sesión',
    'action.register': 'Registrarse',
    'action.logout': 'Cerrar sesión',
    'action.forgotPassword': '¿Olvidaste tu contraseña?',
    'action.resetPassword': 'Restablecer contraseña',
    'action.backToLogin': 'Volver al inicio',
    'action.createAccount': 'Crear cuenta',
    'action.call': 'Llamada de voz',
    'action.videoCall': 'Videollamada',
    'action.endCall': 'Finalizar',
    'action.mute': 'Silenciar',
    'action.unmute': 'Activar audio',
    'action.edit': 'Editar',
    'action.delete': 'Eliminar',
    'action.back': 'Volver',
    'action.search': 'Buscar',
    'action.addUser': 'Agregar usuario',
    'action.startChat': 'Iniciar chat',
    'action.reply': 'Responder',
    'action.forward': 'Reenviar',
    'input.placeholder': 'Escribe un mensaje...',
    'input.email': 'Correo electrónico',
    'input.password': 'Contraseña',
    'input.confirmPassword': 'Confirmar contraseña',
    'input.name': 'Nombre completo',
    'input.search': 'Buscar conversaciones...',
    'input.searchUsers': 'Buscar usuarios...',
    'error.uploadFailed': 'Error al subir.',
    'error.unsupportedFile': 'Tipo de archivo no compatible.',
    'error.fileTooLarge': 'El archivo es demasiado grande.',
    'error.sendFailed': 'Error al enviar el mensaje.',
    'error.offline': 'Estás sin conexión.',
    'error.generic': 'Algo salió mal.',
    'error.invalidCredentials': 'Credenciales inválidas.',
    'error.emailExists': 'Ya existe una cuenta con este correo.',
    'error.weakPassword': 'La contraseña debe tener al menos 8 caracteres.',
    'error.passwordMismatch': 'Las contraseñas no coinciden.',
    'error.emailNotFound': 'No se encontró una cuenta con este correo.',
    'error.cameraPermission': 'Acceso a cámara denegado.',
    'error.microphonePermission': 'Acceso a micrófono denegado.',
    'file.image': 'Imagen',
    'file.video': 'Vídeo',
    'file.audio': 'Audio',
    'file.document': 'Documento',
    'file.text': 'Archivo de texto',
    'queue.processing': 'Procesando elementos en cola...',
    'queue.itemsQueued': 'elementos en cola',
    'network.online': 'Has vuelto a conectarte',
    'network.offline': 'Estás sin conexión',
    'network.reconnecting': 'Reconectando...',
    'conversations.title': 'Conversaciones',
    'conversations.empty': 'No hay conversaciones aún',
    'language.english': 'English',
    'language.spanish': 'Español',
    'auth.welcome': 'Bienvenido',
    'auth.loginTitle': 'Inicia sesión',
    'auth.registerTitle': 'Crea tu cuenta',
    'auth.forgotTitle': 'Restablece tu contraseña',
    'auth.loginSubtitle': 'Ingresa tus credenciales',
    'auth.registerSubtitle': 'Completa tus datos',
    'auth.forgotSubtitle': 'Ingresa tu correo',
    'auth.noAccount': '¿No tienes cuenta?',
    'auth.hasAccount': '¿Ya tienes cuenta?',
    'auth.resetSent': '¡Enlace enviado!',
    'auth.resetSentDesc': 'Revisa tu correo.',
    'typing.indicator': 'está escribiendo...',
    'typing.multiple': 'están escribiendo...',
    'call.incoming': 'Llamada entrante',
    'call.outgoing': 'Llamando...',
    'call.connecting': 'Conectando...',
    'call.connected': 'Conectado',
    'call.ended': 'Llamada finalizada',
    'call.duration': 'Duración',
    'call.history': 'Llamadas recientes',
    'call.missed': 'Perdida',
    'call.completed': 'Completada',
    'call.declined': 'Rechazada',
    'call.noHistory': 'Sin llamadas recientes',
    'message.edited': 'editado',
    'message.deleted': 'Mensaje eliminado',
    'message.deleteConfirm': '¿Eliminar mensaje?',
    'message.forwarded': 'Reenviado',
    'upload.image': 'Imagen',
    'upload.video': 'Vídeo',
    'upload.audio': 'Audio',
    'upload.file': 'Archivo',
    'group.members': 'miembros',
    'group.create': 'Crear grupo',
    'group.name': 'Nombre del grupo',
    'group.namePlaceholder': 'Ingresa el nombre...',
    'group.createButton': 'Crear',
    'group.minMembers': 'Selecciona al menos 2 miembros',
    'users.available': 'Usuarios disponibles',
    'users.noResults': 'No se encontraron usuarios',
    'tabs.chats': 'Chats',
    'tabs.calls': 'Llamadas',
    'tabs.users': 'Usuarios',
    'vanish.on': 'Temporal',
    'vanish.off': 'Modo temporal',
    'vanish.turnOff': 'Desactivar modo temporal',
    'vanish.willDisappear': 'El mensaje desaparecerá',
    'viewOnce.label': 'Ver una vez',
    'viewOnce.tapToView': 'Toca para ver',
    'viewOnce.opened': 'Foto/Video abierto',
    'viewOnce.willDisappear': 'Desaparecerá al cerrar',
    'reactions.title': 'Reacciones',
    'reactions.people': 'personas',
    'voice.recording': 'Grabando',
    'voice.send': 'Enviar mensaje de voz',
    'voice.cancel': 'Cancelar grabación',
    'search.noResults': 'No se encontraron mensajes',
    'search.results': 'resultados',
    'notification.enable': 'Habilitar notificaciones',
    'notification.enableDesc': 'Recibe notificaciones de nuevos mensajes',
    'notification.later': 'Después',
    'pin.message': 'Fijar mensaje',
    'pin.unpin': 'Desfijar mensaje',
    'readBy.title': 'Leído por',
    'ai.title': 'Asistente IA',
    'ai.placeholder': 'Pregúntame algo...',
    'theme.light': 'Claro',
    'theme.dark': 'Oscuro',
    'theme.system': 'Sistema',
    'queue.pending': 'pendiente',
    'queue.failed': 'fallido',
    'schedule.title': 'Programar Mensaje',
    'schedule.quickOptions': 'Opciones rápidas',
    'schedule.customTime': 'O elige una hora personalizada',
    'schedule.inHour': 'En 1 hora',
    'schedule.inHours': 'En 3 horas',
    'schedule.tomorrowMorning': 'Mañana por la mañana',
    'schedule.tomorrowEvening': 'Mañana por la tarde',
    'schedule.scheduled': 'Mensaje programado',
    'schedule.cancelled': 'Mensaje programado cancelado',
    'forward.title': 'Reenviar Mensaje',
    'forward.selectConversation': 'Selecciona una conversación',
  },
};

export function t(key: TranslationKey, language: Language): string {
  return translations[language][key] || translations['en'][key] || key;
}

export function getAvailableLanguages(): { code: Language; name: string }[] {
  return [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
  ];
}

export { translations };
export type { TranslationKey };
