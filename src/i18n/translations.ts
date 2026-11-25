import type { Locale, TaskStatus } from '../types/api';

export interface Translations {
  platformName: string;
  nav: {
    overview: string;
    commandCenter: string;
    aiTasks: string;
    settings: string;
  };
  header: {
    newChat: string;
    unconnectedBanner: string;
    liveBanner: string;
    noOrganization: string;
    awaitingConnection: string;
    lightMode: string;
    darkMode: string;
    organizationLabel: string;
    signOut: string;
    signInViaFrontend1: string;
    sessionRequiredTitle: string;
    signedOutNotice: string;
  };
  overview: {
    title: string;
    subtitle: string;
    activeTasksLabel: string;
    awaitingApprovalLabel: string;
    chatsCountLabel: string;
    openCommandCenter: string;
    openTasks: string;
    architectureTitle: string;
    architectureDesc: string;
    recentTasksTitle: string;
  };
  chat: {
    historyTitle: string;
    searchPlaceholder: string;
    sortNewest: string;
    sortOldest: string;
    newChat: string;
    renameChat: string;
    deleteChat: string;
    confirmDelete: string;
    cancel: string;
    save: string;
    emptyHistory: string;
    emptyConversationTitle: string;
    emptyConversationSubtitle: string;
    composerPlaceholder: string;
    send: string;
    stop: string;
    retry: string;
    copy: string;
    copied: string;
    attachFiles: string;
    dropFilesHere: string;
    supportedFormatsHint: string;
    streamingLabel: string;
    stoppedNotice: string;
    errorFallback: string;
    uploadingFile: string;
    cancelUpload: string;
    removeAttachment: string;
    contentReadyHint: string;
    downloadFile: string;
    uploadPermissionDenied: string;
    prompts: Array<{ title: string; prompt: string }>;
  };
  tasks: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    allStatuses: string;
    allAgents: string;
    taskId: string;
    taskName: string;
    agent: string;
    status: string;
    startedAt: string;
    completedAt: string;
    actions: string;
    viewDetails: string;
    emptyTitle: string;
    emptySubtitle: string;
    errorTitle: string;
    retryLoad: string;
    detailTitle: string;
    resultSection: string;
    errorSection: string;
    stepsSection: string;
    approvalSection: string;
    approvalNotePlaceholder: string;
    approveAction: string;
    rejectAction: string;
    financialRestrictionNote: string;
    readOnlyNotice: string;
    close: string;
    statuses: Record<TaskStatus, string>;
  };
  settings: {
    title: string;
    subtitle: string;
    architectureSection: string;
    bffEndpointLabel: string;
    apiModeLabel: string;
    authProviderLabel: string;
    securityPolicyTitle: string;
    securityPolicyItems: string[];
    preferencesSection: string;
    languageLabel: string;
    themeLabel: string;
    clearLocalCache: string;
    cacheCleared: string;
  };
}

export const TRANSLATIONS: Record<Locale, Translations> = {
  uz: {
    platformName: 'ALJABR Platform',
    nav: {
      overview: 'Boshqaruv paneli',
      commandCenter: 'AI Command Center',
      aiTasks: 'AI Tasks',
      settings: 'Sozlamalar',
    },
    header: {
      newChat: 'Yangi suhbat',
      unconnectedBanner: 'Ulanmagan · FastAPI Backend kutilmoqda',
      liveBanner: 'BFF API faol (/api/v1)',
      noOrganization: 'Tashkilot ulanmagan (Backend kutilmoqda)',
      awaitingConnection: 'Ulanish kutilmoqda',
      lightMode: 'Yorug‘ rejim',
      darkMode: 'Qorong‘i rejim',
      organizationLabel: 'Tashkilot',
      signOut: 'Chiqish',
      signInViaFrontend1: 'Frontend 1 portaliga o‘tish',
      sessionRequiredTitle: 'Frontend 1 SSO sessiyasi talab etiladi',
      signedOutNotice:
        'Siz platforma sessiyasidan chiqdingiz. Maxfiy lokal ma’lumotlar tozalandi; davom etish uchun Frontend 1 tizimidan qayta kiring.',
    },
    overview: {
      title: 'ALJABR AI Business Operations Platform',
      subtitle:
        'Korporativ operatsiyalar, AI agent vazifalari va hujjat tahlilini yagona interfeysda boshqaring.',
      activeTasksLabel: 'Faol AI vazifalar',
      awaitingApprovalLabel: 'Inson tasdig‘ini kutmoqda',
      chatsCountLabel: 'Joriy tashkilot suhbatlari',
      openCommandCenter: 'AI Command Center’ni ochish',
      openTasks: 'AI Tasks navbatini ko‘rish',
      architectureTitle: 'Yagona Integratsiya Arxitekturasi',
      architectureDesc:
        'Barcha so‘rovlar yagona BFF (/api/v1/*) orqali FastAPI Business Backend va AI Engine’ga yo‘naltiriladi. Mustaqil Gemini ulanishi mavjud emas.',
      recentTasksTitle: 'So‘nggi AI agent vazifalari',
    },
    chat: {
      historyTitle: 'Suhbatlar tarixi',
      searchPlaceholder: 'Suhbatlarni qidirish...',
      sortNewest: 'Yangi avval',
      sortOldest: 'Eski avval',
      newChat: 'Yangi suhbat',
      renameChat: 'Nomini o‘zgartirish',
      deleteChat: 'O‘chirish',
      confirmDelete: 'Ha, o‘chirish',
      cancel: 'Bekor qilish',
      save: 'Saqlash',
      emptyHistory: 'Ushbu tashkilot uchun suhbatlar topilmadi.',
      emptyConversationTitle: 'AI Command Center bilan ishlashni boshlang',
      emptyConversationSubtitle:
        'Hujjatlarni biriktiring, operatsion tahlil so‘rang yoki AI agentlaridan hisobot tayyorlashni iltimos qiling.',
      composerPlaceholder:
        'Savol yozing yoki topshiriq bering... (Yangi qator: Shift+Enter)',
      send: 'Yuborish',
      stop: 'To‘xtatish',
      retry: 'Qayta urinish',
      copy: 'Nusxalash',
      copied: 'Nusxalandi',
      attachFiles: 'Fayl biriktirish',
      dropFilesHere: 'Fayllarni shu yerga tashlang',
      supportedFormatsHint: 'PDF, DOCX, XLSX, CSV, TXT, PNG, JPG (maks. 10 MB)',
      streamingLabel: 'AI javob yozmoqda...',
      stoppedNotice: 'Generatsiya foydalanuvchi tomonidan to‘xtatildi.',
      errorFallback: 'Server bilan aloqa uzildi yoki xatolik yuz berdi.',
      uploadingFile: 'Yuklanmoqda',
      cancelUpload: 'Yuklashni bekor qilish',
      removeAttachment: 'Biriktirmani olib tashlash',
      contentReadyHint: 'Mazmun serverda saqlandi',
      downloadFile: 'Faylni yuklab olish',
      uploadPermissionDenied: 'Sizning rolingizda fayl yuklash ruxsati yo‘q.',
      prompts: [
        {
          title: 'Ombor qoldiqlari tahlili',
          prompt:
            'Toshkent markaziy omboridagi oxirgi 30 kunlik mahsulot aylanmasi bo‘yicha qisqacha jadval va xulosa tayyorla.',
        },
        {
          title: 'Shartnoma xavf tekshiruvi',
          prompt:
            'Yetkazib beruvchi shartnomasidagi kechikish jarimalari va SLA bandlarini tekshirish mezonlarini ro‘yxat ko‘rinishida ber.',
        },
        {
          title: 'API integratsiya namunasi',
          prompt:
            'FastAPI Business Backend uchun `/api/v1/tasks` endpointi bilan ishlaydigan TypeScript klient misolini ko‘rsat.',
        },
      ],
    },
    tasks: {
      title: 'AI Tasks boshqaruvi',
      subtitle:
        'AI agentlari bajarayotgan operatsion vazifalarni kuzating va ruxsat etilgan amallarni tasdiqlang.',
      searchPlaceholder: 'Vazifa nomi, ID yoki agent bo‘yicha qidirish...',
      allStatuses: 'Barcha holatlar',
      allAgents: 'Barcha agentlar',
      taskId: 'ID',
      taskName: 'Vazifa nomi',
      agent: 'Mas’ul AI agent',
      status: 'Holat',
      startedAt: 'Boshlanish vaqti',
      completedAt: 'Yakunlanish vaqti',
      actions: 'Amallar',
      viewDetails: 'Tafsilotlar',
      emptyTitle: 'Mos vazifalar topilmadi',
      emptySubtitle: 'Filtrlarni o‘zgartiring yoki qidiruv matnini tozalang.',
      errorTitle: 'Vazifalar ro‘yxatini yuklab bo‘lmadi',
      retryLoad: 'Qayta yuklash',
      detailTitle: 'Vazifa tafsilotlari',
      resultSection: 'Vazifa natijasi',
      errorSection: 'Xatolik sababi',
      stepsSection: 'Bajarish bosqichlari',
      approvalSection: 'Inson tasdig‘i (Operatsion nazorat)',
      approvalNotePlaceholder: 'Tasdiqlash yoki rad etish izohini kiriting (ixtiyoriy)...',
      approveAction: 'Tasdiqlash',
      rejectAction: 'Rad etish',
      financialRestrictionNote:
        'Xavfsizlik siyosati: AI agentlari orqali moliyaviy to‘lovlarni amalga oshirish, qabul qilish yoki tasdiqlash qat’iyan taqiqlangan.',
      readOnlyNotice:
        'Faqat ko‘rish rejimi: vazifalarni tasdiqlash yoki rad etish uchun operatsion ruxsat talab etiladi.',
      close: 'Yopish',
      statuses: {
        Pending: 'Kutilmoqda',
        Running: 'Bajarilmoqda',
        Completed: 'Bajarildi',
        Failed: 'Xatolik yuz berdi',
        Cancelled: 'Bekor qilindi',
        'Awaiting Approval': 'Tasdiq kutilmoqda',
      },
    },
    settings: {
      title: 'Platforma sozlamalari',
      subtitle:
        'Tizim konfiguratsiyasi Frontend 1 va server muhitidan markazlashgan holda boshqariladi.',
      architectureSection: 'Server va API konfiguratsiyasi (Faqat o‘qish uchun)',
      bffEndpointLabel: 'BFF API bazaviy manzili',
      apiModeLabel: 'Ishlash rejimi',
      authProviderLabel: 'Autentifikatsiya provayderi',
      securityPolicyTitle: 'Faol xavfsizlik cheklovlari',
      securityPolicyItems: [
        'Foydalanuvchi tomonidan backend manzilini o‘zgartirish o‘chirilgan.',
        'Soxta sessiya tiklash (/auth/restore) olib tashlangan; faqat imzolangan Frontend 1 SSO ishlatiladi.',
        '?embed parametri orqali autentifikatsiyani chetlab o‘tish bloklangan.',
        'Suhbatlar, biriktirilgan fayllar va vazifalar foydalanuvchi hamda tashkilot bo‘yicha serverda ajratilgan.',
      ],
      preferencesSection: 'Interfeys sozlamalari',
      languageLabel: 'Interfeys tili',
      themeLabel: 'Mavzu ko‘rinishi',
      clearLocalCache: 'Lokal keshni tozalash',
      cacheCleared: 'Lokal suhbat keshi tozalandi.',
    },
  },
  en: {
    platformName: 'ALJABR Platform',
    nav: {
      overview: 'Dashboard',
      commandCenter: 'AI Command Center',
      aiTasks: 'AI Tasks',
      settings: 'Settings',
    },
    header: {
      newChat: 'New Chat',
      unconnectedBanner: 'Not Connected · Ready for Backend Integration',
      liveBanner: 'BFF API Active (/api/v1)',
      noOrganization: 'No organization connected (Awaiting Backend)',
      awaitingConnection: 'Awaiting Connection',
      lightMode: 'Light Mode',
      darkMode: 'Dark Mode',
      organizationLabel: 'Organization',
      signOut: 'Sign Out',
      signInViaFrontend1: 'Go to Frontend 1 Portal',
      sessionRequiredTitle: 'Frontend 1 SSO Session Required',
      signedOutNotice:
        'You have signed out and local tenant cache has been cleared. Authenticate through the Frontend 1 host portal to continue.',
    },
    overview: {
      title: 'ALJABR AI Business Operations Platform',
      subtitle:
        'Manage enterprise operations, AI agent tasks, and document analysis inside a unified workspace.',
      activeTasksLabel: 'Active AI Tasks',
      awaitingApprovalLabel: 'Awaiting Human Approval',
      chatsCountLabel: 'Workspace Conversations',
      openCommandCenter: 'Open AI Command Center',
      openTasks: 'View AI Tasks Queue',
      architectureTitle: 'Unified Integration Architecture',
      architectureDesc:
        'All requests flow through the unified BFF (/api/v1/*) to the FastAPI Business Backend and AI Engine. Direct standalone Gemini calls have been removed.',
      recentTasksTitle: 'Recent AI Agent Tasks',
    },
    chat: {
      historyTitle: 'Conversations',
      searchPlaceholder: 'Search conversations...',
      sortNewest: 'Newest first',
      sortOldest: 'Oldest first',
      newChat: 'New Chat',
      renameChat: 'Rename',
      deleteChat: 'Delete',
      confirmDelete: 'Confirm delete',
      cancel: 'Cancel',
      save: 'Save',
      emptyHistory: 'No conversations found for this organization.',
      emptyConversationTitle: 'Start working with AI Command Center',
      emptyConversationSubtitle:
        'Attach corporate documents, request operational analytics, or ask agents to structure reports.',
      composerPlaceholder:
        'Write a message or operational request... (New line: Shift+Enter)',
      send: 'Send',
      stop: 'Stop',
      retry: 'Retry',
      copy: 'Copy',
      copied: 'Copied',
      attachFiles: 'Attach files',
      dropFilesHere: 'Drop files here to attach',
      supportedFormatsHint: 'PDF, DOCX, XLSX, CSV, TXT, PNG, JPG (max 10 MB)',
      streamingLabel: 'AI is generating response...',
      stoppedNotice: 'Generation stopped by operator.',
      errorFallback: 'Connection interrupted or server error occurred.',
      uploadingFile: 'Uploading',
      cancelUpload: 'Cancel upload',
      removeAttachment: 'Remove attachment',
      contentReadyHint: 'Content stored on server',
      downloadFile: 'Download file',
      uploadPermissionDenied: 'Your role does not have file upload permission.',
      prompts: [
        {
          title: 'Inventory Turnover Analysis',
          prompt:
            'Prepare a concise summary table and operational insights for the last 30 days of warehouse inventory turnover.',
        },
        {
          title: 'Contract SLA Checklist',
          prompt:
            'List key SLA compliance and penalty clauses to audit in supplier service agreements.',
        },
        {
          title: 'TypeScript API Client Example',
          prompt:
            'Show a clean TypeScript client pattern calling `/api/v1/tasks` through our BFF with AbortController.',
        },
      ],
    },
    tasks: {
      title: 'AI Tasks Monitor',
      subtitle:
        'Track operational tasks executed by AI agents and review permitted human-in-the-loop approvals.',
      searchPlaceholder: 'Search by task name, ID, or agent...',
      allStatuses: 'All statuses',
      allAgents: 'All agents',
      taskId: 'ID',
      taskName: 'Task Name',
      agent: 'Responsible Agent',
      status: 'Status',
      startedAt: 'Started',
      completedAt: 'Completed',
      actions: 'Actions',
      viewDetails: 'Inspect',
      emptyTitle: 'No matching tasks',
      emptySubtitle: 'Adjust status filters or clear your search query.',
      errorTitle: 'Unable to load AI tasks',
      retryLoad: 'Retry',
      detailTitle: 'Task Details',
      resultSection: 'Execution Result',
      errorSection: 'Failure Reason',
      stepsSection: 'Execution Steps',
      approvalSection: 'Human Approval (Operational Control)',
      approvalNotePlaceholder: 'Add an optional approval or rejection note...',
      approveAction: 'Approve',
      rejectAction: 'Reject',
      financialRestrictionNote:
        'Security policy: Initiating, accepting, or approving financial payments via AI is strictly prohibited.',
      readOnlyNotice:
        'Read-only access: operator decision permissions are required to approve or reject tasks.',
      close: 'Close',
      statuses: {
        Pending: 'Pending',
        Running: 'Running',
        Completed: 'Completed',
        Failed: 'Failed',
        Cancelled: 'Cancelled',
        'Awaiting Approval': 'Awaiting Approval',
      },
    },
    settings: {
      title: 'Platform Settings',
      subtitle:
        'System configuration is centrally managed via Frontend 1 and verified server configuration.',
      architectureSection: 'Server & API Configuration (Read-Only)',
      bffEndpointLabel: 'BFF API Base Path',
      apiModeLabel: 'Runtime Mode',
      authProviderLabel: 'Authentication Provider',
      securityPolicyTitle: 'Active Security Safeguards',
      securityPolicyItems: [
        'User-editable backend URL override is disabled.',
        'Mock session restore (/auth/restore) is removed; uses signed Frontend 1 SSO sessions.',
        '?embed query parameter authentication bypass is disabled.',
        'Chats, uploaded file contents, and AI tasks are isolated by user and organization on the server.',
      ],
      preferencesSection: 'Interface Preferences',
      languageLabel: 'Language',
      themeLabel: 'Appearance',
      clearLocalCache: 'Clear Local Cache',
      cacheCleared: 'Local conversation cache cleared.',
    },
  },
  ru: {
    platformName: 'ALJABR Platform',
    nav: {
      overview: 'Панель управления',
      commandCenter: 'AI Command Center',
      aiTasks: 'AI Tasks',
      settings: 'Настройки',
    },
    header: {
      newChat: 'Новый чат',
      unconnectedBanner: 'Не подключено · Ожидание FastAPI Backend',
      liveBanner: 'BFF API активен (/api/v1)',
      noOrganization: 'Организация не подключена (Ожидание Backend)',
      awaitingConnection: 'Ожидание подключения',
      lightMode: 'Светлая тема',
      darkMode: 'Тёмная тема',
      organizationLabel: 'Организация',
      signOut: 'Выйти',
      signInViaFrontend1: 'Перейти на портал Frontend 1',
      sessionRequiredTitle: 'Требуется SSO-сессия Frontend 1',
      signedOutNotice:
        'Вы вышли из сессии платформы, локальный кэш очищен. Для продолжения выполните вход через портал Frontend 1.',
    },
    overview: {
      title: 'ALJABR AI Business Operations Platform',
      subtitle:
        'Управляйте корпоративными операциями, задачами AI-агентов и анализом документов в едином интерфейсе.',
      activeTasksLabel: 'Активные AI-задачи',
      awaitingApprovalLabel: 'Ожидают подтверждения',
      chatsCountLabel: 'Чаты организации',
      openCommandCenter: 'Открыть AI Command Center',
      openTasks: 'Открыть очередь AI Tasks',
      architectureTitle: 'Единая архитектура интеграции',
      architectureDesc:
        'Все запросы проходят через единый BFF (/api/v1/*) к FastAPI Business Backend и AI Engine. Прямое подключение к Gemini отключено.',
      recentTasksTitle: 'Последние задачи AI-агентов',
    },
    chat: {
      historyTitle: 'История чатов',
      searchPlaceholder: 'Поиск по чатам...',
      sortNewest: 'Сначала новые',
      sortOldest: 'Сначала старые',
      newChat: 'Новый чат',
      renameChat: 'Переименовать',
      deleteChat: 'Удалить',
      confirmDelete: 'Подтвердить удаление',
      cancel: 'Отмена',
      save: 'Сохранить',
      emptyHistory: 'Чаты для данной организации не найдены.',
      emptyConversationTitle: 'Начните работу с AI Command Center',
      emptyConversationSubtitle:
        'Прикрепите документы, запросите операционный анализ или попросите агентов подготовить отчёт.',
      composerPlaceholder:
        'Введите сообщение или задачу... (Новая строка: Shift+Enter)',
      send: 'Отправить',
      stop: 'Остановить',
      retry: 'Повторить',
      copy: 'Копировать',
      copied: 'Скопировано',
      attachFiles: 'Прикрепить файл',
      dropFilesHere: 'Перетащите файлы сюда',
      supportedFormatsHint: 'PDF, DOCX, XLSX, CSV, TXT, PNG, JPG (макс. 10 МБ)',
      streamingLabel: 'AI формирует ответ...',
      stoppedNotice: 'Генерация остановлена пользователем.',
      errorFallback: 'Соединение прервано или произошла ошибка сервера.',
      uploadingFile: 'Загрузка',
      cancelUpload: 'Отменить загрузку',
      removeAttachment: 'Удалить вложение',
      contentReadyHint: 'Содержимое сохранено на сервере',
      downloadFile: 'Скачать файл',
      uploadPermissionDenied: 'У вашей роли нет прав на загрузку файлов.',
      prompts: [
        {
          title: 'Анализ складских остатков',
          prompt:
            'Подготовь сводную таблицу и выводы по оборачиваемости товаров на центральном складе за последние 30 дней.',
        },
        {
          title: 'Проверка SLA договора',
          prompt:
            'Составь чек-лист проверки штрафов за просрочку и условий SLA в договорах поставщиков.',
        },
        {
          title: 'Пример TypeScript API-клиента',
          prompt:
            'Покажи пример TypeScript-клиента для `/api/v1/tasks` через BFF с использованием AbortController.',
        },
      ],
    },
    tasks: {
      title: 'Монитор AI Tasks',
      subtitle:
        'Отслеживайте операционные задачи AI-агентов и подтверждайте разрешённые действия.',
      searchPlaceholder: 'Поиск по названию, ID или агенту...',
      allStatuses: 'Все статусы',
      allAgents: 'Все агенты',
      taskId: 'ID',
      taskName: 'Задача',
      agent: 'Ответственный агент',
      status: 'Статус',
      startedAt: 'Начало',
      completedAt: 'Завершение',
      actions: 'Действия',
      viewDetails: 'Подробнее',
      emptyTitle: 'Подходящие задачи не найдены',
      emptySubtitle: 'Измените фильтры или очистите строку поиска.',
      errorTitle: 'Не удалось загрузить список задач',
      retryLoad: 'Повторить',
      detailTitle: 'Детали задачи',
      resultSection: 'Результат выполнения',
      errorSection: 'Причина ошибки',
      stepsSection: 'Этапы выполнения',
      approvalSection: 'Подтверждение человеком (Операционный контроль)',
      approvalNotePlaceholder: 'Добавьте комментарий к решению (необязательно)...',
      approveAction: 'Подтвердить',
      rejectAction: 'Отклонить',
      financialRestrictionNote:
        'Политика безопасности: выполнение, приём или подтверждение финансовых платежей через AI строго запрещено.',
      readOnlyNotice:
        'Только просмотр: для подтверждения или отклонения задач требуются права оператора.',
      close: 'Закрыть',
      statuses: {
        Pending: 'Ожидание',
        Running: 'Выполняется',
        Completed: 'Завершено',
        Failed: 'Ошибка',
        Cancelled: 'Отменено',
        'Awaiting Approval': 'Ожидает подтверждения',
      },
    },
    settings: {
      title: 'Настройки платформы',
      subtitle:
        'Системная конфигурация управляется централизованно через Frontend 1 и серверные настройки.',
      architectureSection: 'Конфигурация сервера и API (Только чтение)',
      bffEndpointLabel: 'Базовый путь BFF API',
      apiModeLabel: 'Режим работы',
      authProviderLabel: 'Провайдер аутентификации',
      securityPolicyTitle: 'Активные меры безопасности',
      securityPolicyItems: [
        'Изменение адреса backend пользователем отключено.',
        'Фиктивное восстановление сессии (/auth/restore) удалено; используется подписанная SSO-сессия Frontend 1.',
        'Обход аутентификации через параметр ?embed заблокирован.',
        'Чаты, содержимое загруженных файлов и AI-задачи изолированы по пользователю и организации на сервере.',
      ],
      preferencesSection: 'Настройки интерфейса',
      languageLabel: 'Язык интерфейса',
      themeLabel: 'Оформление',
      clearLocalCache: 'Очистить локальный кэш',
      cacheCleared: 'Локальный кэш чатов очищен.',
    },
  },
};
