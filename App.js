/**
 * ============================================================================
 * 🎮 POKÉDEX PRO — Versão Definitiva e Máxima
 * ============================================================================
 *
 * Projeto: Pokédex Ultra-Profissional com React Native + Expo
 * Compatibilidade: 100% Expo Go + Expo Web
 *
 * FUNCIONALIDADES PRINCIPAIS:
 * ✅ Header clássico da Pokédex (#DC0A2D com lente azul e reflexo branco)
 * ✅ Tabs: LISTA | BUSCA AVANÇADA | FAVORITOS
 * ✅ Grid de 2 colunas com Infinite Scroll (30 por vez) + Pull-to-Refresh
 * ✅ Tela de detalhe fullscreen com imagem grande, Shiny, Mega/Primal, Grito 🔊
 * ✅ Radar chart perfeito (anéis, labels, pontos brancos, preenchimento semi-transparente)
 * ✅ Seção completa de efetividade (Fraquezas, Resistências, Imunidades) com badges coloridas
 * ✅ Linha evolutiva horizontal clicável
 * ✅ Moves em pills (primeiros 30 ataques)
 * ✅ Informações completas: descrição PT/EN, altura, peso, habitat, capture rate, abilities
 * ✅ Favoritos persistentes com AsyncStorage + coração + Haptics
 * ✅ Busca avançada com 4 modos (name, type, generation, id) + aliases em português
 * ✅ Temas dark/light completos e alternáveis
 * ✅ Imagens otimizadas com expo-image
 * ✅ Código 100% comentado em português
 * ✅ StyleSheet gigantesco com centenas de estilos profissionais
 * ✅ UI 100% em português, responsiva e performática
 * ✅ Cleanup correto de áudio no unmount
 *
 * ESTRUTURA DO ARQUIVO:
 * 1. Imports completos
 * 2. Constantes (TYPE_ALIASES, TYPE_COLORS, THEMES, STAT_LABELS, etc.)
 * 3. Funções auxiliares (normalizeText, resolveTypeName, RadarChart, AudioPlayIcon, etc.)
 * 4. Funções de fetch e lógica (loadPokemons, fetchFullDetails, calculateDefenses, etc.)
 * 5. Componente App() com todos os states e refs
 * 6. useEffects necessários
 * 7. Handlers de eventos
 * 8. Funções de renderização (renderListItem, renderDetail, renderPokemonCard)
 * 9. Return completo com SafeAreaView + header + tabs + render condicional
 * 10. StyleSheet.create gigantesco no final
 * DATA: 2026
 * ============================================================================
 */

// ============================================================================
// 1. IMPORTS COMPLETOS
// ============================================================================
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as Localization from 'expo-localization';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    FlatList,
    Keyboard,
    Platform,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    Vibration,
    View,
    useWindowDimensions,
} from 'react-native';
import Svg, {
    Circle,
    Defs,
    G,
    Line,
    Polygon,
    RadialGradient,
    Stop,
    Text as SvgText,
} from 'react-native-svg';

// ============================================================================
// 2. CONSTANTES GLOBAIS
// ============================================================================

// Dimensões da tela para responsividade
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const IS_WEB = Platform.OS === 'web';
const IS_IOS = Platform.OS === 'ios';

// Configurações de paginação e performance
const POKEMON_BATCH_SIZE = 30; // 30 Pokémon por carregamento (infinite scroll)
const INITIAL_OFFSET = 0;
const MAX_CACHE_SIZE = 100; // Cache máximo para evitar memory leak

// ============================================================================
// 2.1 ALIASES DE TIPOS EM PORTUGUÊS (Busca inteligente)
// ============================================================================
const TYPE_ALIASES = {
    // Normal
    normal: 'normal',
    normaltype: 'normal',

    // Fire / Fogo
    fogo: 'fire',
    fire: 'fire',
    flametype: 'fire',
    chama: 'fire',

    // Water / Água
    agua: 'water',
    água: 'water',
    water: 'water',
    aqua: 'water',
    hidro: 'water',

    // Grass / Grama
    grama: 'grass',
    grass: 'grass',
    planta: 'grass',
    vegetal: 'grass',
    folha: 'grass',

    // Electric / Elétrico
    eletrico: 'electric',
    elétrico: 'electric',
    electric: 'electric',
    raio: 'electric',
    choque: 'electric',
    voltaic: 'electric',

    // Ice / Gelo
    ice: 'ice',
    gelo: 'ice',
    freeze: 'ice',
    congelar: 'ice',

    // Fighting / Lutador
    lutador: 'fighting',
    fighting: 'fighting',
    luta: 'fighting',
    marcial: 'fighting',

    // Poison / Veneno
    veneno: 'poison',
    poison: 'poison',
    toxico: 'poison',
    tóxico: 'poison',

    // Ground / Terra
    terra: 'ground',
    ground: 'ground',
    solo: 'ground',
    terrestre: 'ground',

    // Flying / Voador
    voador: 'flying',
    flying: 'flying',
    voo: 'flying',
    aéreo: 'flying',
    aereo: 'flying',

    // Psychic / Psíquico
    psicico: 'psychic',
    psíquico: 'psychic',
    psychic: 'psychic',
    mente: 'psychic',
    psi: 'psychic',

    // Bug / Inseto
    inseto: 'bug',
    bug: 'bug',
    bicho: 'bug',
    inset: 'bug',

    // Rock / Pedra
    pedra: 'rock',
    rock: 'rock',
    rocha: 'rock',
    stone: 'rock',

    // Ghost / Fantasma
    fantasma: 'ghost',
    ghost: 'ghost',
    espirito: 'ghost',
    espírito: 'ghost',
    assombracao: 'ghost',
    assombração: 'ghost',

    // Dragon / Dragão
    dragao: 'dragon',
    dragão: 'dragon',
    dragon: 'dragon',
    drake: 'dragon',

    // Dark / Noturno/Sombrio
    dark: 'dark',
    sombrio: 'dark',
    sinistro: 'dark',
    escuro: 'dark',
    trevas: 'dark',

    // Steel / Aço
    metal: 'steel',
    steel: 'steel',
    ferro: 'steel',
    aço: 'steel',
    aco: 'steel',

    // Fairy / Fada
    fada: 'fairy',
    fairy: 'fairy',
    feerico: 'fairy',
    feérico: 'fairy',
    magico: 'fairy',
    mágico: 'fairy',
};

// ============================================================================
// 2.2 CORES DOS TIPOS (Padrão oficial Pokédex)
// ============================================================================
const TYPE_COLORS = {
    normal: '#A8A77A',
    fire: '#EE8130',
    water: '#6390F0',
    electric: '#F7D02C',
    grass: '#7AC74C',
    ice: '#96D9D6',
    fighting: '#C22E28',
    poison: '#A33EA1',
    ground: '#E2BF65',
    flying: '#A98FF3',
    psychic: '#F95587',
    bug: '#A6B91A',
    rock: '#B6A136',
    ghost: '#735797',
    dragon: '#6F35FC',
    dark: '#705746',
    steel: '#B7B7CE',
    fairy: '#D685AD',
    unknown: '#686868',
    shadow: '#704170',
};

// ============================================================================
// 2.3 TEMAS: DARK E LIGHT (Completo e profissional)
// ============================================================================
const THEMES = {
    dark: {
        id: 'dark',
        // Cores de fundo e superfície
        screen: '#0B1020',
        card: '#121A2C',
        surface: '#0B1020',
        header: '#DC0A2D',
        headerGradientStart: '#DC0A2D',
        headerGradientEnd: '#9E0B22',

        // Cores de texto
        text: '#F8FAFC',
        textPrimary: '#FFFFFF',
        textSecondary: '#E2E8F0',
        mutedText: '#94A3B8',
        disabledText: '#64748B',

        // Bordas e divisores
        border: 'rgba(255,255,255,0.08)',
        subBorder: 'rgba(255,255,255,0.12)',
        separator: 'rgba(255,255,255,0.06)',

        // Inputs e controles
        inputBg: '#1E293B',
        inputBorder: 'rgba(255,255,255,0.15)',
        inputPlaceholder: '#64748B',

        // Estados e feedback
        infoBg: '#1E293B',
        stateBg: '#1E293B',
        successBg: 'rgba(34,197,94,0.15)',
        warningBg: 'rgba(245,158,11,0.15)',
        errorBg: 'rgba(248,113,113,0.15)',

        // Radar chart
        chartGrid: 'rgba(255,255,255,0.14)',
        chartAxis: 'rgba(255,255,255,0.18)',
        chartLabel: '#F8FAFC',
        chartPoint: '#FFFFFF',
        chartFillAlpha: 0.42,

        // Botões e interações
        activeText: '#111827',
        inactiveText: '#D7DEEA',
        buttonPrimary: '#F7C948',
        buttonPrimaryText: '#111827',
        buttonSecondary: '#334155',
        buttonSecondaryText: '#F8FAFC',

        // Sombras e elevação
        shadow: '#000000',
        shadowOpacity: 0.35,
        shadowRadius: 20,

        // Tabs e navegação
        tabActive: '#F7C948',
        tabInactive: '#64748B',
        tabBg: 'rgba(15,23,42,0.6)',

        // Favoritos e badges
        favoriteActive: '#EF4444',
        favoriteInactive: '#64748B',
        badgeBg: 'rgba(255,255,255,0.1)',
    },

    light: {
        id: 'light',
        // Cores de fundo e superfície
        screen: '#F5F7FB',
        card: '#FFFFFF',
        surface: '#F8FAFC',
        header: '#DC0A2D',
        headerGradientStart: '#DC0A2D',
        headerGradientEnd: '#9E0B22',

        // Cores de texto
        text: '#0F172A',
        textPrimary: '#1E293B',
        textSecondary: '#334155',
        mutedText: '#64748B',
        disabledText: '#94A3B8',

        // Bordas e divisores
        border: 'rgba(15,23,42,0.08)',
        subBorder: 'rgba(15,23,42,0.12)',
        separator: 'rgba(15,23,42,0.06)',

        // Inputs e controles
        inputBg: '#FFFFFF',
        inputBorder: 'rgba(15,23,42,0.15)',
        inputPlaceholder: '#94A3B8',

        // Estados e feedback
        infoBg: '#F1F5F9',
        stateBg: '#F1F5F9',
        successBg: 'rgba(34,197,94,0.12)',
        warningBg: 'rgba(245,158,11,0.12)',
        errorBg: 'rgba(248,113,113,0.12)',

        // Radar chart
        chartGrid: 'rgba(15,23,42,0.12)',
        chartAxis: 'rgba(15,23,42,0.18)',
        chartLabel: '#0F172A',
        chartPoint: '#FFFFFF',
        chartFillAlpha: 0.38,

        // Botões e interações
        activeText: '#FFFFFF',
        inactiveText: '#334155',
        buttonPrimary: '#F7C948',
        buttonPrimaryText: '#111827',
        buttonSecondary: '#E2E8F0',
        buttonSecondaryText: '#1E293B',

        // Sombras e elevação
        shadow: '#94A3B8',
        shadowOpacity: 0.15,
        shadowRadius: 12,

        // Tabs e navegação
        tabActive: '#DC0A2D',
        tabInactive: '#94A3B8',
        tabBg: 'rgba(255,255,255,0.9)',

        // Favoritos e badges
        favoriteActive: '#DC0A2D',
        favoriteInactive: '#CBD5E1',
        badgeBg: 'rgba(15,23,42,0.06)',
    },
};

// ============================================================================
// 2.4 LABELS E CONFIGURAÇÕES DE STATUS (Radar Chart)
// ============================================================================
const STAT_LABELS = {
    hp: 'HP',
    attack: 'Atk',
    defense: 'Def',
    'special-attack': 'SpA',
    'special-defense': 'SpD',
    speed: 'Spe',
};

const STAT_LABELS_FULL = {
    hp: 'Pontos de Vida',
    attack: 'Ataque Físico',
    defense: 'Defesa Física',
    'special-attack': 'Ataque Especial',
    'special-defense': 'Defesa Especial',
    speed: 'Velocidade',
};

const STAT_KEYS = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];
const STAT_MAX_VALUE = 255; // Valor máximo padrão para barras de status

// ============================================================================
// 2.5 CONFIGURAÇÕES DE GERAÇÕES (Busca por geração)
// ============================================================================
const GENERATION_ALIASES = {
    1: '1',
    i: '1',
    kanto: '1',
    2: '2',
    ii: '2',
    johto: '2',
    3: '3',
    iii: '3',
    hoenn: '3',
    4: '4',
    iv: '4',
    sinnoh: '4',
    5: '5',
    v: '5',
    unova: '5',
    6: '6',
    vi: '6',
    kalos: '6',
    7: '7',
    vii: '7',
    alola: '7',
    8: '8',
    viii: '8',
    galar: '8',
    9: '9',
    ix: '9',
    paldea: '9',
};

const GENERATION_RANGES = {
    1: { start: 1, end: 151 },
    2: { start: 152, end: 251 },
    3: { start: 252, end: 386 },
    4: { start: 387, end: 493 },
    5: { start: 494, end: 649 },
    6: { start: 650, end: 721 },
    7: { start: 722, end: 809 },
    8: { start: 810, end: 905 },
    9: { start: 906, end: 1025 },
};

// ============================================================================
// 2.6 IDIOMAS E LOCALIZAÇÃO (UI + tradução automática)
// ============================================================================
const SUPPORTED_LANGUAGES = ['pt', 'en', 'es', 'fr', 'de', 'ja'];
const LANGUAGE_STORAGE_KEY = '@pokedex_pro:language';

const LANGUAGE_OPTIONS = {
    pt: { code: 'pt', label: 'PT', name: 'Português' },
    en: { code: 'en', label: 'EN', name: 'English' },
    es: { code: 'es', label: 'ES', name: 'Español' },
    fr: { code: 'fr', label: 'FR', name: 'Français' },
    de: { code: 'de', label: 'DE', name: 'Deutsch' },
    ja: { code: 'ja', label: 'JP', name: '日本語' },
};

const UI_TRANSLATIONS = {
    pt: {
        appTitle: 'POKÉDEX PRO',
        version: 'v2.0',
        language: 'IDIOMA',
        tabs: { list: 'LISTA', search: 'BUSCA AVANÇADA', favorites: 'FAVORITOS' },
        list: {
            heroTitle: 'Catálogo principal',
            heroDescription:
                'Arraste para atualizar, carregue 30 Pokémon por vez e toque em qualquer card para abrir o detalhe completo.',
            statsLoaded: '{{count}} Pokémon carregados',
            statsPages: 'páginas',
            searchAction: 'BUSCA AVANÇADA',
            quickPlaceholder: 'Busca rápida por nome ou ID...',
            loadingMore: 'Carregando mais Pokémon...',
            emptyTitle: 'Nenhum Pokémon carregado',
            emptyDescription:
                'Use o botão de atualização para tentar novamente ou avance para a busca avançada.',
            emptyAction: 'BUSCA AVANÇADA',
        },
        search: {
            heroTitle: 'Busca avançada',
            heroDescription:
                'Use nome, tipo, geração ou ID para encontrar Pokémon com suporte a português e inglês.',
            modeName: 'NOME',
            modeType: 'TIPO',
            modeGeneration: 'GERAÇÃO',
            modeId: 'ID',
            helpName: 'Digite um Pokémon como pikachu, mr mime, ho-oh ou charizard.',
            helpType: 'Aceita português e inglês: fogo, água, grama, elétrico, dragão.',
            helpGeneration: 'Digite 1, 2, 3, kanto, johto, hoenn e outras gerações.',
            helpId: 'Digite o número nacional da Pokédex, como 25, 150 ou 898.',
            placeholderName: 'pikachu, mr mime, ho-oh',
            placeholderType: 'fogo, água, grama, elétrico',
            placeholderGeneration: '1, kanto, johto, hoenn',
            placeholderId: '25, 150, 898',
            imageLabel: 'IMAGEM',
            buttonSearch: 'BUSCAR',
            buttonClear: 'LIMPAR',
            loading: 'Buscando dados na PokéAPI...',
            emptyTitle: 'Faça uma busca avançada',
            emptyDescription: 'Use nome, tipo, geração ou ID para encontrar Pokémon.',
            emptyAction: 'BUSCAR',
            errorEmpty: 'Digite um valor para continuar.',
            errorNotFound: 'Pokémon não encontrado. Verifique o nome ou ID informado.',
            resultsCount: '{{count}} resultados encontrados',
        },
        favorites: {
            heroTitle: 'Favoritos',
            heroDescription:
                'Seus Pokémon salvos localmente com AsyncStorage. Toque em um card para abrir o detalhe completo.',
            loaded: '{{count}} salvos',
            emptyTitle: 'Nenhum favorito ainda',
            emptyDescription:
                'Salve qualquer Pokémon a partir do detalhe completo usando o botão de coração.',
            emptyAction: 'EXPLORAR LISTA',
            loading: 'Carregando favoritos...',
        },
        detail: {
            back: 'VOLTAR',
            favoriteAdd: '♥ FAVORITAR',
            favoriteRemove: '♥ SALVO',
            shiny: 'SHINY',
            official: 'OFICIAL',
            classic: 'CLÁSSICO',
            mega: 'MEGA/PRIMAL',
            cry: 'GRITO',
            forms: 'FORMAS',
            radar: 'Radar de Status',
            effectiveness: 'EFETIVIDADE',
            weaknesses: 'FRAQUEZAS',
            resistances: 'RESISTÊNCIAS',
            immunities: 'IMUNIDADES',
            info: 'INFORMAÇÕES',
            description: 'DESCRIÇÃO',
            moves: 'MOVIMENTOS',
            evolution: 'LINHA EVOLUTIVA',
            statsBase: 'STATUS BASE',
            statsMega: 'STATUS MEGA',
            noEvolution: 'Linha evolutiva indisponível.',
            noMoves: 'Nenhum movimento disponível.',
            height: 'Altura',
            weight: 'Peso',
            habitat: 'Habitat',
            capture: 'Taxa de Captura',
            growth: 'Crescimento',
            color: 'Cor',
            abilities: 'Habilidades',
            eggs: 'Ovos',
            types: 'Tipos',
            legendary: 'LENDÁRIO',
            mythical: 'MÍTICO',
            shinyRate: 'Taxa Shiny: 1/4096 (0.024%)',
            capturePrefix: 'Taxa de Captura: ',
            favoriteInfo: 'Adicionar aos favoritos',
        },
        common: {
            loading: 'Carregando...',
            empty: 'Sem resultados.',
            notFound: 'Não encontrado.',
            noDescription: 'Descrição não disponível.',
            networkError: 'Erro de conexão.',
        },
    },
    en: {
        appTitle: 'POKÉDEX PRO',
        version: 'v2.0',
        language: 'LANGUAGE',
        tabs: { list: 'LIST', search: 'ADVANCED SEARCH', favorites: 'FAVORITES' },
        list: {
            heroTitle: 'Main catalog',
            heroDescription:
                'Pull to refresh, load 30 Pokémon at a time, and tap any card to open the full detail view.',
            statsLoaded: '{{count}} Pokémon loaded',
            statsPages: 'pages',
            searchAction: 'ADVANCED SEARCH',
            quickPlaceholder: 'Quick search by name or ID...',
            loadingMore: 'Loading more Pokémon...',
            emptyTitle: 'No Pokémon loaded',
            emptyDescription: 'Use refresh to try again or jump into advanced search.',
            emptyAction: 'ADVANCED SEARCH',
        },
        search: {
            heroTitle: 'Advanced search',
            heroDescription:
                'Search by name, type, generation, or ID with Portuguese and English support.',
            modeName: 'NAME',
            modeType: 'TYPE',
            modeGeneration: 'GENERATION',
            modeId: 'ID',
            helpName: 'Type a Pokémon like pikachu, mr mime, ho-oh, or charizard.',
            helpType: 'Supports Portuguese and English: fire, water, grass, electric, dragon.',
            helpGeneration: 'Type 1, 2, 3, kanto, johto, hoenn, and other generations.',
            helpId: 'Type the National Pokédex number like 25, 150, or 898.',
            placeholderName: 'pikachu, mr mime, ho-oh',
            placeholderType: 'fire, water, grass, electric',
            placeholderGeneration: '1, kanto, johto, hoenn',
            placeholderId: '25, 150, 898',
            imageLabel: 'IMAGE',
            buttonSearch: 'SEARCH',
            buttonClear: 'CLEAR',
            loading: 'Fetching data from PokéAPI...',
            emptyTitle: 'Start an advanced search',
            emptyDescription: 'Use name, type, generation, or ID to find Pokémon.',
            emptyAction: 'SEARCH',
            errorEmpty: 'Enter a value to continue.',
            errorNotFound: 'Pokémon not found. Check the name or ID.',
            resultsCount: '{{count}} results found',
        },
        favorites: {
            heroTitle: 'Favorites',
            heroDescription:
                'Your Pokémon saved locally with AsyncStorage. Tap a card to open the full detail view.',
            loaded: '{{count}} saved',
            emptyTitle: 'No favorites yet',
            emptyDescription: 'Save any Pokémon from the full detail view using the heart button.',
            emptyAction: 'EXPLORE LIST',
            loading: 'Loading favorites...',
        },
        detail: {
            back: 'BACK',
            favoriteAdd: '♥ FAVORITE',
            favoriteRemove: '♥ SAVED',
            shiny: 'SHINY',
            official: 'OFFICIAL',
            classic: 'CLASSIC',
            mega: 'MEGA/PRIMAL',
            cry: 'CRY',
            forms: 'FORMS',
            radar: 'Stat Radar',
            effectiveness: 'EFFECTIVENESS',
            weaknesses: 'WEAKNESSES',
            resistances: 'RESISTANCES',
            immunities: 'IMMUNITIES',
            info: 'INFORMATION',
            description: 'DESCRIPTION',
            moves: 'MOVES',
            evolution: 'EVOLUTION LINE',
            statsBase: 'BASE STATS',
            statsMega: 'MEGA STATS',
            noEvolution: 'Evolution line unavailable.',
            noMoves: 'No moves available.',
            height: 'Height',
            weight: 'Weight',
            habitat: 'Habitat',
            capture: 'Capture Rate',
            growth: 'Growth',
            color: 'Color',
            abilities: 'Abilities',
            eggs: 'Egg Groups',
            types: 'Types',
            legendary: 'LEGENDARY',
            mythical: 'MYTHICAL',
            shinyRate: 'Shiny Rate: 1/4096 (0.024%)',
            capturePrefix: 'Capture Rate: ',
            favoriteInfo: 'Add to favorites',
        },
        common: {
            loading: 'Loading...',
            empty: 'No results.',
            notFound: 'Not found.',
            noDescription: 'Description unavailable.',
            networkError: 'Connection error.',
        },
    },
    es: {
        appTitle: 'POKÉDEX PRO',
        version: 'v2.0',
        language: 'IDIOMA',
        tabs: { list: 'LISTA', search: 'BÚSQUEDA AVANZADA', favorites: 'FAVORITOS' },
        list: {
            heroTitle: 'Catálogo principal',
            heroDescription:
                'Desliza para actualizar, carga 30 Pokémon a la vez y toca una tarjeta para ver el detalle completo.',
            statsLoaded: '{{count}} Pokémon cargados',
            statsPages: 'páginas',
            searchAction: 'BÚSQUEDA AVANZADA',
            quickPlaceholder: 'Búsqueda rápida por nombre o ID...',
            loadingMore: 'Cargando más Pokémon...',
            emptyTitle: 'No hay Pokémon cargados',
            emptyDescription: 'Usa actualizar o ve a la búsqueda avanzada.',
            emptyAction: 'BÚSQUEDA AVANZADA',
        },
        search: {
            heroTitle: 'Búsqueda avanzada',
            heroDescription:
                'Busca por nombre, tipo, generación o ID con soporte para portugués e inglés.',
            modeName: 'NOMBRE',
            modeType: 'TIPO',
            modeGeneration: 'GENERACIÓN',
            modeId: 'ID',
            helpName: 'Escribe un Pokémon como pikachu, mr mime, ho-oh o charizard.',
            helpType: 'Admite portugués e inglés: fuego, agua, grama, eléctrico, dragón.',
            helpGeneration: 'Escribe 1, 2, 3, kanto, johto, hoenn y otras generaciones.',
            helpId: 'Escribe el número de la Pokédex Nacional como 25, 150 o 898.',
            placeholderName: 'pikachu, mr mime, ho-oh',
            placeholderType: 'fuego, agua, grama, eléctrico',
            placeholderGeneration: '1, kanto, johto, hoenn',
            placeholderId: '25, 150, 898',
            imageLabel: 'IMAGEN',
            buttonSearch: 'BUSCAR',
            buttonClear: 'LIMPIAR',
            loading: 'Consultando PokéAPI...',
            emptyTitle: 'Haz una búsqueda avanzada',
            emptyDescription: 'Usa nombre, tipo, generación o ID para encontrar Pokémon.',
            emptyAction: 'BUSCAR',
            errorEmpty: 'Escribe un valor para continuar.',
            errorNotFound: 'Pokémon no encontrado. Revisa el nombre o ID.',
            resultsCount: '{{count}} resultados encontrados',
        },
        favorites: {
            heroTitle: 'Favoritos',
            heroDescription:
                'Tus Pokémon guardados localmente con AsyncStorage. Toca una tarjeta para abrir el detalle completo.',
            loaded: '{{count}} guardados',
            emptyTitle: 'Aún no hay favoritos',
            emptyDescription:
                'Guarda cualquier Pokémon desde el detalle completo con el botón de corazón.',
            emptyAction: 'EXPLORAR LISTA',
            loading: 'Cargando favoritos...',
        },
        detail: {
            back: 'ATRÁS',
            favoriteAdd: '♥ FAVORITO',
            favoriteRemove: '♥ GUARDADO',
            shiny: 'SHINY',
            official: 'OFICIAL',
            classic: 'CLÁSICO',
            mega: 'MEGA/PRIMAL',
            cry: 'GRITO',
            forms: 'FORMAS',
            radar: 'Radar de estadísticas',
            effectiveness: 'EFECTIVIDAD',
            weaknesses: 'DEBILIDADES',
            resistances: 'RESISTENCIAS',
            immunities: 'INMUNIDADES',
            info: 'INFORMACIÓN',
            description: 'DESCRIPCIÓN',
            moves: 'MOVIMIENTOS',
            evolution: 'LÍNEA EVOLUTIVA',
            statsBase: 'ESTADÍSTICAS BASE',
            statsMega: 'ESTADÍSTICAS MEGA',
            noEvolution: 'Línea evolutiva no disponible.',
            noMoves: 'No hay movimientos disponibles.',
            height: 'Altura',
            weight: 'Peso',
            habitat: 'Hábitat',
            capture: 'Tasa de captura',
            growth: 'Crecimiento',
            color: 'Color',
            abilities: 'Habilidades',
            eggs: 'Grupos de huevos',
            types: 'Tipos',
            legendary: 'LEGENDARIO',
            mythical: 'MÍTICO',
            shinyRate: 'Tasa Shiny: 1/4096 (0.024 %)',
            capturePrefix: 'Tasa de captura: ',
            favoriteInfo: 'Añadir a favoritos',
        },
        common: {
            loading: 'Cargando...',
            empty: 'Sin resultados.',
            notFound: 'No encontrado.',
            noDescription: 'Descripción no disponible.',
            networkError: 'Error de conexión.',
        },
    },
    fr: {
        appTitle: 'POKÉDEX PRO',
        version: 'v2.0',
        language: 'LANGUE',
        tabs: { list: 'LISTE', search: 'RECHERCHE AVANCÉE', favorites: 'FAVORIS' },
        list: {
            heroTitle: 'Catalogue principal',
            heroDescription:
                'Tirez pour rafraîchir, chargez 30 Pokémon à la fois et touchez une carte pour ouvrir le détail complet.',
            statsLoaded: '{{count}} Pokémon chargés',
            statsPages: 'pages',
            searchAction: 'RECHERCHE AVANCÉE',
            quickPlaceholder: 'Recherche rapide par nom ou ID...',
            loadingMore: 'Chargement de plus de Pokémon...',
            emptyTitle: 'Aucun Pokémon chargé',
            emptyDescription: 'Utilisez rafraîchir ou passez à la recherche avancée.',
            emptyAction: 'RECHERCHE AVANCÉE',
        },
        search: {
            heroTitle: 'Recherche avancée',
            heroDescription:
                'Recherchez par nom, type, génération ou ID avec prise en charge du portugais et de l’anglais.',
            modeName: 'NOM',
            modeType: 'TYPE',
            modeGeneration: 'GÉNÉRATION',
            modeId: 'ID',
            helpName: 'Tapez un Pokémon comme pikachu, mr mime, ho-oh ou charizard.',
            helpType:
                'Prend en charge le portugais et l’anglais : feu, eau, plante, électrique, dragon.',
            helpGeneration: 'Tapez 1, 2, 3, kanto, johto, hoenn et d’autres générations.',
            helpId: 'Tapez le numéro du Pokédex national comme 25, 150 ou 898.',
            placeholderName: 'pikachu, mr mime, ho-oh',
            placeholderType: 'feu, eau, plante, électrique',
            placeholderGeneration: '1, kanto, johto, hoenn',
            placeholderId: '25, 150, 898',
            imageLabel: 'IMAGE',
            buttonSearch: 'RECHERCHER',
            buttonClear: 'EFFACER',
            loading: 'Interrogation de PokéAPI...',
            emptyTitle: 'Lancez une recherche avancée',
            emptyDescription:
                'Utilisez le nom, le type, la génération ou l’ID pour trouver des Pokémon.',
            emptyAction: 'RECHERCHER',
            errorEmpty: 'Entrez une valeur pour continuer.',
            errorNotFound: 'Pokémon introuvable. Vérifiez le nom ou l’ID.',
            resultsCount: '{{count}} résultats trouvés',
        },
        favorites: {
            heroTitle: 'Favoris',
            heroDescription:
                'Vos Pokémon enregistrés localement avec AsyncStorage. Touchez une carte pour ouvrir le détail complet.',
            loaded: '{{count}} enregistrés',
            emptyTitle: 'Aucun favori',
            emptyDescription:
                'Enregistrez n’importe quel Pokémon depuis le détail complet avec le bouton cœur.',
            emptyAction: 'EXPLORER LA LISTE',
            loading: 'Chargement des favoris...',
        },
        detail: {
            back: 'RETOUR',
            favoriteAdd: '♥ AJOUTER',
            favoriteRemove: '♥ ENREGISTRÉ',
            shiny: 'SHINY',
            official: 'OFFICIEL',
            classic: 'CLASSIQUE',
            mega: 'MEGA/PRIMAL',
            cry: 'CRI',
            forms: 'FORMES',
            radar: 'Radar des stats',
            effectiveness: 'EFFICACITÉ',
            weaknesses: 'FAIBLESSES',
            resistances: 'RÉSISTANCES',
            immunities: 'IMMUNITÉS',
            info: 'INFORMATIONS',
            description: 'DESCRIPTION',
            moves: 'ATTAQUES',
            evolution: 'LIGNE ÉVOLUTIVE',
            statsBase: 'STATS DE BASE',
            statsMega: 'STATS MEGA',
            noEvolution: 'Ligne évolutive indisponible.',
            noMoves: 'Aucune attaque disponible.',
            height: 'Taille',
            weight: 'Poids',
            habitat: 'Habitat',
            capture: 'Taux de capture',
            growth: 'Croissance',
            color: 'Couleur',
            abilities: 'Capacités',
            eggs: 'Groupes d’œufs',
            types: 'Types',
            legendary: 'LÉGENDAIRE',
            mythical: 'MYTHIQUE',
            shinyRate: 'Taux Shiny : 1/4096 (0.024 %)',
            capturePrefix: 'Taux de capture : ',
            favoriteInfo: 'Ajouter aux favoris',
        },
        common: {
            loading: 'Chargement...',
            empty: 'Aucun résultat.',
            notFound: 'Introuvable.',
            noDescription: 'Description indisponible.',
            networkError: 'Erreur de connexion.',
        },
    },
    de: {
        appTitle: 'POKÉDEX PRO',
        version: 'v2.0',
        language: 'SPRACHE',
        tabs: { list: 'LISTE', search: 'ERWEITERTE SUCHE', favorites: 'FAVORITEN' },
        list: {
            heroTitle: 'Hauptkatalog',
            heroDescription:
                'Zum Aktualisieren ziehen, 30 Pokémon pro Seite laden und eine Karte antippen, um die Detailansicht zu öffnen.',
            statsLoaded: '{{count}} Pokémon geladen',
            statsPages: 'Seiten',
            searchAction: 'ERWEITERTE SUCHE',
            quickPlaceholder: 'Schnellsuche nach Name oder ID...',
            loadingMore: 'Mehr Pokémon werden geladen...',
            emptyTitle: 'Keine Pokémon geladen',
            emptyDescription: 'Aktualisieren oder die erweiterte Suche verwenden.',
            emptyAction: 'ERWEITERTE SUCHE',
        },
        search: {
            heroTitle: 'Erweiterte Suche',
            heroDescription:
                'Suche nach Name, Typ, Generation oder ID mit Unterstützung für Portugiesisch und Englisch.',
            modeName: 'NAME',
            modeType: 'TYP',
            modeGeneration: 'GENERATION',
            modeId: 'ID',
            helpName: 'Gib ein Pokémon wie pikachu, mr mime, ho-oh oder charizard ein.',
            helpType:
                'Unterstützt Portugiesisch und Englisch: feuer, wasser, pflanze, elektrisch, drache.',
            helpGeneration: 'Gib 1, 2, 3, kanto, johto, hoenn und weitere Generationen ein.',
            helpId: 'Gib die Nationale Pokédex-Nummer ein, z. B. 25, 150 oder 898.',
            placeholderName: 'pikachu, mr mime, ho-oh',
            placeholderType: 'feuer, wasser, pflanze, elektrisch',
            placeholderGeneration: '1, kanto, johto, hoenn',
            placeholderId: '25, 150, 898',
            imageLabel: 'BILD',
            buttonSearch: 'SUCHEN',
            buttonClear: 'LÖSCHEN',
            loading: 'PokéAPI wird abgefragt...',
            emptyTitle: 'Starte eine erweiterte Suche',
            emptyDescription: 'Nutze Name, Typ, Generation oder ID, um Pokémon zu finden.',
            emptyAction: 'SUCHEN',
            errorEmpty: 'Gib einen Wert ein, um fortzufahren.',
            errorNotFound: 'Pokémon nicht gefunden. Überprüfe Name oder ID.',
            resultsCount: '{{count}} Ergebnisse gefunden',
        },
        favorites: {
            heroTitle: 'Favoriten',
            heroDescription:
                'Deine lokal mit AsyncStorage gespeicherten Pokémon. Tippe auf eine Karte, um die vollständige Detailansicht zu öffnen.',
            loaded: '{{count}} gespeichert',
            emptyTitle: 'Noch keine Favoriten',
            emptyDescription: 'Speichere jedes Pokémon aus der Detailansicht mit dem Herz-Button.',
            emptyAction: 'LISTE ERKUNDEN',
            loading: 'Favoriten werden geladen...',
        },
        detail: {
            back: 'ZURÜCK',
            favoriteAdd: '♥ HINZUFÜGEN',
            favoriteRemove: '♥ GESPEICHERT',
            shiny: 'SHINY',
            official: 'OFFIZIELL',
            classic: 'KLASSISCH',
            mega: 'MEGA/PRIMAL',
            cry: 'RUF',
            forms: 'FORMEN',
            radar: 'Status-Radar',
            effectiveness: 'WIRKUNG',
            weaknesses: 'SCHWÄCHEN',
            resistances: 'RESISTENZEN',
            immunities: 'IMMUNITÄTEN',
            info: 'INFORMATIONEN',
            description: 'BESCHREIBUNG',
            moves: 'ATTACKEN',
            evolution: 'ENTWICKLUNGSLINIE',
            statsBase: 'BASISWERTE',
            statsMega: 'MEGA-WERTE',
            noEvolution: 'Entwicklungslinie nicht verfügbar.',
            noMoves: 'Keine Attacken verfügbar.',
            height: 'Größe',
            weight: 'Gewicht',
            habitat: 'Lebensraum',
            capture: 'Fangrate',
            growth: 'Wachstum',
            color: 'Farbe',
            abilities: 'Fähigkeiten',
            eggs: 'Eiergruppen',
            types: 'Typen',
            legendary: 'LEGENDE',
            mythical: 'MYTHISCH',
            shinyRate: 'Shiny-Rate: 1/4096 (0.024 %)',
            capturePrefix: 'Fangrate: ',
            favoriteInfo: 'Zu Favoriten hinzufügen',
        },
        common: {
            loading: 'Wird geladen...',
            empty: 'Keine Ergebnisse.',
            notFound: 'Nicht gefunden.',
            noDescription: 'Beschreibung nicht verfügbar.',
            networkError: 'Verbindungsfehler.',
        },
    },
    ja: {
        appTitle: 'POKÉDEX PRO',
        version: 'v2.0',
        language: '言語',
        tabs: { list: 'リスト', search: '詳細検索', favorites: 'お気に入り' },
        list: {
            heroTitle: 'メインカタログ',
            heroDescription:
                '引っ張って更新、30匹ずつ読み込み、カードをタップすると詳細を表示します。',
            statsLoaded: '{{count}}匹読み込み済み',
            statsPages: 'ページ',
            searchAction: '詳細検索',
            quickPlaceholder: '名前またはIDでクイック検索...',
            loadingMore: 'さらに読み込み中...',
            emptyTitle: 'ポケモンがまだ読み込まれていません',
            emptyDescription: '更新するか詳細検索を使ってください。',
            emptyAction: '詳細検索',
        },
        search: {
            heroTitle: '詳細検索',
            heroDescription:
                '名前・タイプ・世代・IDで検索できます。ポルトガル語と英語をサポートします。',
            modeName: '名前',
            modeType: 'タイプ',
            modeGeneration: '世代',
            modeId: 'ID',
            helpName: 'pikachu, mr mime, ho-oh, charizard のように入力してください。',
            helpType: 'ポルトガル語と英語に対応: fire, water, grass, electric, dragon。',
            helpGeneration: '1, 2, 3, kanto, johto, hoenn などを入力してください。',
            helpId: '25, 150, 898 のような全国図鑑番号を入力してください。',
            placeholderName: 'pikachu, mr mime, ho-oh',
            placeholderType: 'fire, water, grass, electric',
            placeholderGeneration: '1, kanto, johto, hoenn',
            placeholderId: '25, 150, 898',
            imageLabel: '画像',
            buttonSearch: '検索',
            buttonClear: 'クリア',
            loading: 'PokéAPIを取得中...',
            emptyTitle: '詳細検索を始めましょう',
            emptyDescription: '名前、タイプ、世代、IDでポケモンを検索できます。',
            emptyAction: '検索',
            errorEmpty: '続けるには値を入力してください。',
            errorNotFound: 'ポケモンが見つかりません。名前またはIDを確認してください。',
            resultsCount: '{{count}}件見つかりました',
        },
        favorites: {
            heroTitle: 'お気に入り',
            heroDescription:
                'AsyncStorage で保存されたポケモンです。カードをタップすると詳細を開きます。',
            loaded: '{{count}}件保存済み',
            emptyTitle: 'お気に入りはまだありません',
            emptyDescription: '詳細画面のハートボタンでポケモンを保存してください。',
            emptyAction: 'リストを見る',
            loading: 'お気に入りを読み込み中...',
        },
        detail: {
            back: '戻る',
            favoriteAdd: '♥ お気に入り',
            favoriteRemove: '♥ 保存済み',
            shiny: '色違い',
            official: '公式',
            classic: 'クラシック',
            mega: 'メガ/プライマル',
            cry: '鳴き声',
            forms: 'フォルム',
            radar: 'ステータスレーダー',
            effectiveness: '相性',
            weaknesses: '弱点',
            resistances: '耐性',
            immunities: '無効',
            info: '情報',
            description: '説明',
            moves: 'わざ',
            evolution: '進化系統',
            statsBase: '基本ステータス',
            statsMega: 'メガステータス',
            noEvolution: '進化系統はありません。',
            noMoves: 'わざはありません。',
            height: '高さ',
            weight: '重さ',
            habitat: '生息地',
            capture: '捕獲率',
            growth: '成長',
            color: '色',
            abilities: 'とくせい',
            eggs: 'タマゴグループ',
            types: 'タイプ',
            legendary: '伝説',
            mythical: '幻',
            shinyRate: '色違い確率: 1/4096 (0.024%)',
            capturePrefix: '捕獲率: ',
            favoriteInfo: 'お気に入りに追加',
        },
        common: {
            loading: '読み込み中...',
            empty: '結果がありません。',
            notFound: '見つかりません。',
            noDescription: '説明はありません。',
            networkError: '接続エラー。',
        },
    },
};

const TYPE_LOCALIZED_NAMES = {
    normal: {
        pt: 'Normal',
        en: 'Normal',
        es: 'Normal',
        fr: 'Normal',
        de: 'Normal',
        ja: 'ノーマル',
    },
    fire: { pt: 'Fogo', en: 'Fire', es: 'Fuego', fr: 'Feu', de: 'Feuer', ja: 'ほのお' },
    water: { pt: 'Água', en: 'Water', es: 'Agua', fr: 'Eau', de: 'Wasser', ja: 'みず' },
    electric: {
        pt: 'Elétrico',
        en: 'Electric',
        es: 'Eléctrico',
        fr: 'Électrik',
        de: 'Elektro',
        ja: 'でんき',
    },
    grass: { pt: 'Grama', en: 'Grass', es: 'Planta', fr: 'Plante', de: 'Pflanze', ja: 'くさ' },
    ice: { pt: 'Gelo', en: 'Ice', es: 'Hielo', fr: 'Glace', de: 'Eis', ja: 'こおり' },
    fighting: {
        pt: 'Lutador',
        en: 'Fighting',
        es: 'Lucha',
        fr: 'Combat',
        de: 'Kampf',
        ja: 'かくとう',
    },
    poison: { pt: 'Veneno', en: 'Poison', es: 'Veneno', fr: 'Poison', de: 'Gift', ja: 'どく' },
    ground: { pt: 'Terra', en: 'Ground', es: 'Tierra', fr: 'Sol', de: 'Boden', ja: 'じめん' },
    flying: { pt: 'Voador', en: 'Flying', es: 'Volador', fr: 'Vol', de: 'Flug', ja: 'ひこう' },
    psychic: {
        pt: 'Psíquico',
        en: 'Psychic',
        es: 'Psíquico',
        fr: 'Psy',
        de: 'Psycho',
        ja: 'エスパー',
    },
    bug: { pt: 'Inseto', en: 'Bug', es: 'Bicho', fr: 'Insecte', de: 'Käfer', ja: 'むし' },
    rock: { pt: 'Pedra', en: 'Rock', es: 'Roca', fr: 'Roche', de: 'Gestein', ja: 'いわ' },
    ghost: {
        pt: 'Fantasma',
        en: 'Ghost',
        es: 'Fantasma',
        fr: 'Spectre',
        de: 'Geist',
        ja: 'ゴースト',
    },
    dragon: {
        pt: 'Dragão',
        en: 'Dragon',
        es: 'Dragón',
        fr: 'Dragon',
        de: 'Drache',
        ja: 'ドラゴン',
    },
    dark: { pt: 'Sombrio', en: 'Dark', es: 'Siniestro', fr: 'Ténèbres', de: 'Unlicht', ja: 'あく' },
    steel: { pt: 'Aço', en: 'Steel', es: 'Acero', fr: 'Acier', de: 'Stahl', ja: 'はがね' },
    fairy: { pt: 'Fada', en: 'Fairy', es: 'Hada', fr: 'Fée', de: 'Fee', ja: 'フェアリー' },
    unknown: {
        pt: 'Desconhecido',
        en: 'Unknown',
        es: 'Desconocido',
        fr: 'Inconnu',
        de: 'Unbekannt',
        ja: '???',
    },
    shadow: {
        pt: 'Sombra',
        en: 'Shadow',
        es: 'Sombra',
        fr: 'Ombre',
        de: 'Schatten',
        ja: 'シャドウ',
    },
};

const translationCache = new Map();
const LanguageContext = React.createContext('pt');

// ============================================================================
// 2.6 CONFIGURAÇÕES DE IMAGENS E SPRITES
// ============================================================================
const IMAGE_VARIANTS = {
    official: {
        key: 'other.official-artwork.front_default',
        label: 'Oficial',
        priority: [
            'other.official-artwork.front_default',
            'other.official-artwork.front_shiny',
            'front_default',
            'front_shiny',
        ],
    },
    classic: {
        key: 'front_default',
        label: 'Pixel Art',
        priority: ['front_default', 'front_shiny', 'other.official-artwork.front_default'],
    },
    shiny: {
        key: 'front_shiny',
        label: 'Shiny',
        priority: ['front_shiny', 'other.official-artwork.front_shiny', 'front_default'],
    },
    home: {
        key: 'other.home.front_default',
        label: 'Home',
        priority: [
            'other.home.front_default',
            'other.home.front_shiny',
            'other.official-artwork.front_default',
        ],
    },
};

const DEFAULT_IMAGE =
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/0.png';
const POKEAPI_BASE = 'https://pokeapi.co/api/v2';
const SPRITES_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';

// ============================================================================
// 2.7 CONFIGURAÇÕES DE ÁUDIO (Gritos dos Pokémon)
// ============================================================================
const AUDIO_CONFIG = {
    baseUrl: 'https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest',
    extension: '.ogg',
    fallbackUrl: null,
};

// ============================================================================
// 3. FUNÇÕES AUXILIARES GLOBAIS
// ============================================================================

/**
 * Normaliza texto para comparação (remove acentos, lower case, trim)
 * @param {string} value - Texto a ser normalizado
 * @returns {string} Texto normalizado
 */
const normalizeText = (value) => {
    if (!value) return '';
    return value
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, '');
};

/**
 * Resolve alias de tipo para nome oficial em inglês
 * @param {string} value - Nome ou alias do tipo
 * @returns {string} Nome oficial do tipo em inglês
 */
const resolveTypeName = (value) => {
    const normalized = normalizeText(value);
    return TYPE_ALIASES[normalized] || normalized;
};

/**
 * Resolve alias de geração para número oficial
 * @param {string} value - Nome, número ou alias da geração
 * @returns {string} Número da geração (1-9)
 */
const resolveGenerationQuery = (value) => {
    const normalized = normalizeText(value)
        .replace(/^geracao\s*/i, '')
        .replace(/^generation\s*/i, '')
        .replace(/^gen\s*/i, '');
    return GENERATION_ALIASES[normalized] || normalized;
};

/**
 * Obtém a cor hexadecimal de um tipo
 * @param {string} typeName - Nome do tipo
 * @returns {string} Cor hexadecimal
 */
const getTypeColor = (typeName) => {
    const normalized = normalizeText(typeName);
    return TYPE_COLORS[normalized] || TYPE_COLORS.unknown;
};

/**
 * Calcula cor de texto legível sobre fundo colorido (branco ou preto)
 * @param {string} hexColor - Cor hexadecimal de fundo
 * @returns {string} Cor hexadecimal de texto (#FFFFFF ou #111827)
 */
const getReadableTextColor = (hexColor) => {
    if (!hexColor || !hexColor.startsWith('#')) return '#111827';

    const color = hexColor.replace('#', '');
    if (color.length !== 6) return '#111827';

    const red = parseInt(color.slice(0, 2), 16);
    const green = parseInt(color.slice(2, 4), 16);
    const blue = parseInt(color.slice(4, 6), 16);

    // Fórmula de luminância perceptual
    const brightness = (red * 299 + green * 587 + blue * 114) / 1000;
    return brightness > 150 ? '#111827' : '#FFFFFF';
};

/**
 * Converte hex para rgba com alpha personalizado
 * @param {string} hexColor - Cor hexadecimal
 * @param {number} alpha - Valor alpha (0-1)
 * @returns {string} String rgba()
 */
const hexToRgba = (hexColor, alpha = 1) => {
    if (!hexColor || !hexColor.startsWith('#')) return `rgba(0,0,0,${alpha})`;

    const color = hexColor.replace('#', '');
    if (color.length !== 6) return `rgba(0,0,0,${alpha})`;

    const red = parseInt(color.slice(0, 2), 16);
    const green = parseInt(color.slice(2, 4), 16);
    const blue = parseInt(color.slice(4, 6), 16);

    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
};

/**
 * Extrai ID numérico de uma URL da PokeAPI
 * @param {string} url - URL da PokeAPI
 * @returns {number} ID do Pokémon ou Number.MAX_SAFE_INTEGER
 */
const extractIdFromUrl = (url) => {
    if (!url) return Number.MAX_SAFE_INTEGER;
    const match = url.match(/\/(\d+)\/?$/);
    return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
};

/**
 * Formata número com zero à esquerda (ex: 25 → "025")
 * @param {number} num - Número a formatar
 * @param {number} digits - Quantidade de dígitos
 * @returns {string} Número formatado
 */
const formatId = (num, digits = 3) => String(num).padStart(digits, '0');

/**
 * Capitaliza primeira letra de cada palavra
 * @param {string} str - String a capitalizar
 * @returns {string} String capitalizada
 */
const capitalize = (str) => {
    if (!str) return '';
    return str
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

/**
 * Formata descrição removendo quebras de linha e caracteres especiais
 * @param {string} text - Texto da descrição
 * @returns {string} Descrição formatada
 */
const formatDescription = (text) => {
    if (!text) return 'Sem descrição disponível.';
    return text.replace(/\f/g, ' ').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
};

/**
 * Normaliza um idioma para um código curto suportado pelo app
 * @param {string} value - Idioma detectado ou escolhido pelo usuário
 * @returns {string} Código curto do idioma
 */
const normalizeLanguageCode = (value = 'pt') => {
    const normalized = normalizeText(value).split('-')[0];
    if (SUPPORTED_LANGUAGES.includes(normalized)) return normalized;
    if (normalized === 'ptbr') return 'pt';
    if (normalized === 'zh') return 'en';
    return 'en';
};

/**
 * Detecta o idioma principal do dispositivo
 * @returns {string} Código curto do idioma
 */
const detectDeviceLanguage = () => {
    try {
        const locales = Localization.getLocales?.() || [];
        const locale =
            locales[0]?.languageCode || locales[0]?.languageTag || Localization.locale || 'pt';
        return normalizeLanguageCode(locale);
    } catch {
        return 'pt';
    }
};

/**
 * Resolve uma tradução simples por caminho de chave
 * @param {Object} dictionary - Dicionário de traduções
 * @param {string} path - Caminho da chave (ex: tabs.list)
 * @returns {any} Valor encontrado ou undefined
 */
const getTranslationValue = (dictionary, path) =>
    path.split('.').reduce((current, key) => current?.[key], dictionary);

/**
 * Interpola valores em uma string de tradução
 * @param {string} template - Texto com {{placeholders}}
 * @param {Object} params - Valores de substituição
 * @returns {string} Texto interpolado
 */
const interpolateTranslation = (template, params = {}) =>
    String(template || '').replace(/\{\{(\w+)\}\}/g, (_, key) => String(params[key] ?? ''));

/**
 * Obtém uma tradução de UI com fallback seguro
 * @param {string} key - Chave da tradução
 * @param {string} language - Idioma alvo
 * @param {Object} params - Valores de interpolação
 * @returns {string} Texto traduzido
 */
const translateUi = (key, language = 'pt', params = {}) => {
    const normalizedLanguage = normalizeLanguageCode(language);
    const languageDictionary = UI_TRANSLATIONS[normalizedLanguage] || UI_TRANSLATIONS.pt;
    const fallbackDictionary = UI_TRANSLATIONS.pt;
    const template =
        getTranslationValue(languageDictionary, key) ??
        getTranslationValue(fallbackDictionary, key) ??
        key;
    return interpolateTranslation(template, params);
};

/**
 * Tradução remota com cache simples usando MyMemory
 * @param {string} text - Texto de origem
 * @param {string} sourceLanguage - Idioma de origem
 * @param {string} targetLanguage - Idioma de destino
 * @returns {Promise<string>} Texto traduzido
 */
const translateRemoteText = async (text, sourceLanguage = 'en', targetLanguage = 'pt') => {
    const source = normalizeLanguageCode(sourceLanguage);
    const target = normalizeLanguageCode(targetLanguage);
    const normalizedText = String(text ?? '').trim();

    if (!normalizedText) return '';
    if (source === target) return normalizedText;

    const cacheKey = `${source}:${target}:${normalizedText}`;
    if (translationCache.has(cacheKey)) return translationCache.get(cacheKey);

    try {
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(normalizedText)}&langpair=${source}|${target}`;
        const response = await fetch(url);
        const data = await response.json();
        const translated = data?.responseData?.translatedText?.trim() || normalizedText;
        translationCache.set(cacheKey, translated);
        return translated;
    } catch {
        translationCache.set(cacheKey, normalizedText);
        return normalizedText;
    }
};

/**
 * Obtém um nome localizado a partir de uma lista de nomes da PokeAPI
 * @param {Array} names - Array de objetos { language, name }
 * @param {string} language - Idioma alvo
 * @returns {string} Nome localizado ou fallback
 */
const getLocalizedNameFromNames = (names = [], language = 'pt') => {
    const normalizedLanguage = normalizeLanguageCode(language);
    const exactMatch = names.find(
        (entry) => normalizeLanguageCode(entry.language?.name) === normalizedLanguage
    );
    const englishMatch = names.find(
        (entry) => normalizeLanguageCode(entry.language?.name) === 'en'
    );
    return exactMatch?.name || englishMatch?.name || names[0]?.name || '';
};

/**
 * Retorna o nome traduzido de um tipo
 * @param {string} typeName - Nome oficial do tipo
 * @param {string} language - Idioma alvo
 * @returns {string} Nome traduzido
 */
const getLocalizedTypeName = (typeName, language = 'pt') => {
    const normalizedType = resolveTypeName(typeName);
    const normalizedLanguage = normalizeLanguageCode(language);
    return (
        TYPE_LOCALIZED_NAMES[normalizedType]?.[normalizedLanguage] ||
        TYPE_LOCALIZED_NAMES[normalizedType]?.en ||
        capitalize(normalizedType)
    );
};

/**
 * Retorna o nome traduzido da espécie do Pokémon
 * @param {Object} speciesData - Dados de espécie da PokeAPI
 * @param {string} language - Idioma alvo
 * @returns {string} Nome localizado ou original
 */
const getLocalizedSpeciesName = (speciesData, language = 'pt') => {
    const localized = getLocalizedNameFromNames(speciesData?.names || [], language);
    return localized || speciesData?.name || '';
};

/**
 * Retorna um rótulo traduzido para um movimento
 * @param {string} moveName - Nome base do movimento
 * @param {string} language - Idioma alvo
 * @returns {Promise<string>} Nome localizado do movimento
 */
const getLocalizedMoveName = async (moveName, language = 'pt') => {
    const normalizedLanguage = normalizeLanguageCode(language);
    if (normalizedLanguage === 'en') return capitalize(moveName.replace(/-/g, ' '));
    return translateRemoteText(capitalize(moveName.replace(/-/g, ' ')), 'en', normalizedLanguage);
};

/**
 * Traduz a descrição do Pokémon para o idioma alvo
 * @param {Object} speciesData - Dados de espécie da PokeAPI
 * @param {string} language - Idioma alvo
 * @returns {Promise<string>} Descrição localizada
 */
const getLocalizedDescription = async (speciesData, language = 'pt') => {
    const normalizedLanguage = normalizeLanguageCode(language);
    const ptDescription = formatDescription(
        getTranslationValue(
            {
                value: speciesData?.flavor_text_entries?.find(
                    (entry) => normalizeLanguageCode(entry.language?.name) === 'pt'
                )?.flavor_text,
            },
            'value'
        ) ||
            speciesData?.flavor_text_entries?.find(
                (entry) => normalizeLanguageCode(entry.language?.name) === 'pt'
            )?.flavor_text ||
            ''
    );
    const enDescription = formatDescription(
        speciesData?.flavor_text_entries?.find(
            (entry) => normalizeLanguageCode(entry.language?.name) === 'en'
        )?.flavor_text || ''
    );

    if (normalizedLanguage === 'pt')
        return ptDescription || enDescription || translateUi('common.noDescription', 'pt');
    if (normalizedLanguage === 'en')
        return enDescription || ptDescription || translateUi('common.noDescription', 'en');

    const source = ptDescription || enDescription;
    const sourceLanguage = ptDescription ? 'pt' : 'en';
    if (!source) return translateUi('common.noDescription', normalizedLanguage);
    return translateRemoteText(source, sourceLanguage, normalizedLanguage);
};

/**
 * Formata uma lista de moves traduzidos
 * @param {Array} moves - Lista de moves da PokeAPI
 * @param {string} language - Idioma alvo
 * @returns {Promise<Array<string>>} Lista de nomes traduzidos
 */
const getLocalizedMoves = async (moves = [], language = 'pt') => {
    const previewMoves = (moves || []).slice(0, 30);
    const normalizedLanguage = normalizeLanguageCode(language);

    if (normalizedLanguage === 'en') {
        return previewMoves.map((move) => capitalize(move.move?.name?.replace(/-/g, ' ') || ''));
    }

    const translatedMoves = await Promise.all(
        previewMoves.map(async (move) => {
            const name = move.move?.name || '';
            return getLocalizedMoveName(name, normalizedLanguage);
        })
    );

    return translatedMoves.filter(Boolean);
};

/**
 * Retorna um rótulo de status traduzido pela chave do stat
 * @param {string} statKey - Chave do stat
 * @param {string} language - Idioma alvo
 * @returns {string} Rótulo localizado
 */
const getLocalizedStatLabel = (statKey, language = 'pt') => {
    const normalizedLanguage = normalizeLanguageCode(language);
    const labels = {
        pt: {
            hp: 'HP',
            attack: 'Atk',
            defense: 'Def',
            'special-attack': 'SpA',
            'special-defense': 'SpD',
            speed: 'Spe',
        },
        en: {
            hp: 'HP',
            attack: 'Atk',
            defense: 'Def',
            'special-attack': 'SpA',
            'special-defense': 'SpD',
            speed: 'Spe',
        },
        es: {
            hp: 'HP',
            attack: 'Ata',
            defense: 'Def',
            'special-attack': 'AtEsp',
            'special-defense': 'DefEsp',
            speed: 'Vel',
        },
        fr: {
            hp: 'PV',
            attack: 'Atk',
            defense: 'Def',
            'special-attack': 'AtS',
            'special-defense': 'DefS',
            speed: 'Vit',
        },
        de: {
            hp: 'KP',
            attack: 'Ang',
            defense: 'Ver',
            'special-attack': 'SpA',
            'special-defense': 'SpV',
            speed: 'Init',
        },
        ja: {
            hp: 'HP',
            attack: 'こうげき',
            defense: 'ぼうぎょ',
            'special-attack': 'とくこう',
            'special-defense': 'とくぼう',
            speed: 'すばやさ',
        },
    };
    return labels[normalizedLanguage]?.[statKey] || labels.pt[statKey] || statKey;
};

// ============================================================================
// 4. COMPONENTE RADAR CHART (SVG Profissional)
// ============================================================================
/**
 * Radar Chart para visualização de stats do Pokémon
 * Renderiza anéis concêntricos, eixos, labels e polígono de dados
 *
 * @param {Object} props
 * @param {Object} props.stats - Objeto com valores dos stats
 * @param {string} props.color - Cor principal do gráfico
 * @param {Object} props.theme - Objeto de tema atual
 * @param {number} props.size - Tamanho do gráfico em pixels
 */
const RadarChart = React.memo(({ stats, color, theme, size = 240 }) => {
    const language = useContext(LanguageContext);
    // Configurações do gráfico
    const center = size / 2;
    const radius = 78; // Raio máximo do polígono
    const ringSteps = [0.25, 0.5, 0.75, 1]; // Anéis concêntricos
    const angleStep = (Math.PI * 2) / STAT_KEYS.length; // Ângulo entre cada stat

    // Extrai valores dos stats (garante ordem correta)
    const values = STAT_KEYS.map((statKey) => {
        const value = stats?.[statKey];
        return typeof value === 'number' ? value : 0;
    });

    // Calcula valor máximo para normalização (mínimo 100 para escala adequada)
    const maxValue = Math.max(100, ...values);

    /**
     * Calcula coordenadas cartesianas para um ponto no radar
     * @param {number} value - Valor do stat (0-255)
     * @param {number} index - Índice do stat no array STAT_KEYS
     * @returns {string} Coordenadas "x,y" para SVG
     */
    const pointAt = useCallback(
        (value, index) => {
            const ratio = Math.min(value / maxValue, 1); // Normaliza para 0-1
            const angle = -Math.PI / 2 + index * angleStep; // Começa no topo (-90°)
            const x = center + Math.cos(angle) * radius * ratio;
            const y = center + Math.sin(angle) * radius * ratio;
            return `${x.toFixed(2)},${y.toFixed(2)}`;
        },
        [center, radius, angleStep, maxValue]
    );

    /**
     * Gera pontos para um anel concêntrico
     * @param {number} ring - Fator de escala do anel (0.25, 0.5, 0.75, 1)
     * @returns {string} String de pontos para o Polygon SVG
     */
    const ringPoints = useCallback(
        (ring) => {
            return STAT_KEYS.map((_, index) => {
                const angle = -Math.PI / 2 + index * angleStep;
                const x = center + Math.cos(angle) * radius * ring;
                const y = center + Math.sin(angle) * radius * ring;
                return `${x.toFixed(2)},${y.toFixed(2)}`;
            }).join(' ');
        },
        [center, radius, angleStep]
    );

    return (
        <View style={styles.radarWrap} pointerEvents='none'>
            <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {/* Definições de gradientes e filtros */}
                <Defs>
                    <RadialGradient id='radarGradient' cx='50%' cy='50%' r='70%'>
                        <Stop
                            offset='0%'
                            stopColor={color}
                            stopOpacity={theme.chartFillAlpha + 0.15}
                        />
                        <Stop
                            offset='100%'
                            stopColor={color}
                            stopOpacity={theme.chartFillAlpha - 0.1}
                        />
                    </RadialGradient>
                </Defs>

                {/* Anéis concêntricos de referência */}
                {ringSteps.map((ring, ringIndex) => (
                    <Polygon
                        key={`ring-${ringIndex}`}
                        points={ringPoints(ring)}
                        fill='none'
                        stroke={theme.chartGrid}
                        strokeWidth={ring === 1 ? 1.5 : 1}
                        strokeDasharray={ring === 1 ? 'none' : '4,4'}
                        opacity={ring === 1 ? 1 : 0.7}
                    />
                ))}

                {/* Eixos e labels dos stats */}
                {STAT_KEYS.map((statKey, index) => {
                    const angle = -Math.PI / 2 + index * angleStep;
                    const lineX = center + Math.cos(angle) * radius;
                    const lineY = center + Math.sin(angle) * radius;
                    const labelX = center + Math.cos(angle) * (radius + 18);
                    const labelY = center + Math.sin(angle) * (radius + 18);

                    // Alinhamento do texto baseado na posição angular
                    const textAnchor =
                        Math.abs(Math.cos(angle)) < 0.25
                            ? 'middle'
                            : Math.cos(angle) > 0
                              ? 'start'
                              : 'end';

                    return (
                        <G key={`axis-${statKey}`}>
                            {/* Linha do eixo */}
                            <Line
                                x1={center}
                                y1={center}
                                x2={lineX}
                                y2={lineY}
                                stroke={theme.chartAxis}
                                strokeWidth='1'
                                opacity='0.8'
                            />
                            {/* Label do stat */}
                            <SvgText
                                x={labelX}
                                y={labelY}
                                fill={theme.chartLabel}
                                fontSize='10'
                                fontWeight='700'
                                textAnchor={textAnchor}
                                dominantBaseline='middle'
                                opacity='0.95'>
                                {getLocalizedStatLabel(statKey, language)}
                            </SvgText>
                        </G>
                    );
                })}

                {/* Polígono principal com os valores do Pokémon */}
                <Polygon
                    points={STAT_KEYS.map((statKey, index) => pointAt(values[index], index)).join(
                        ' '
                    )}
                    fill={`url(#radarGradient)`}
                    stroke={color}
                    strokeWidth='3'
                    strokeLinejoin='round'
                    opacity='0.95'
                />

                {/* Pontos brancos nos vértices do polígono */}
                {STAT_KEYS.map((statKey, index) => {
                    const point = pointAt(values[index], index).split(',');
                    return (
                        <Circle
                            key={`point-${statKey}`}
                            cx={Number(point[0])}
                            cy={Number(point[1])}
                            r='4'
                            fill={theme.chartPoint}
                            stroke={color}
                            strokeWidth='2.5'
                            opacity='1'
                        />
                    );
                })}

                {/* Ponto central decorativo */}
                <Circle cx={center} cy={center} r='3' fill={color} opacity='0.8' />
            </Svg>
        </View>
    );
});

RadarChart.displayName = 'RadarChart';

// ============================================================================
// 5. COMPONENTE ÍCONE DE ÁUDIO (Botão de grito)
// ============================================================================
/**
 * Ícone SVG de play para botão de áudio
 * @param {Object} props
 * @param {string} props.color - Cor do ícone
 * @param {number} props.size - Tamanho do ícone
 */
const AudioPlayIcon = React.memo(({ color = '#FFFFFF', size = 28 }) => (
    <Svg width={size} height={size} viewBox='0 0 28 28'>
        {/* Círculo de fundo semi-transparente */}
        <Circle
            cx='14'
            cy='14'
            r='13'
            fill='rgba(255,255,255,0.16)'
            stroke='rgba(255,255,255,0.3)'
            strokeWidth='1'
        />
        {/* Triângulo de play */}
        <Polygon
            points='10,9 10,19 18,14'
            fill={color}
            stroke='rgba(0,0,0,0.2)'
            strokeWidth='0.5'
        />
        {/* Ondas sonoras decorativas */}
        <Line
            x1='20'
            y1='10'
            x2='23'
            y2='10'
            stroke={color}
            strokeWidth='2'
            strokeLinecap='round'
            opacity='0.7'
        />
        <Line
            x1='20'
            y1='14'
            x2='24'
            y2='14'
            stroke={color}
            strokeWidth='2'
            strokeLinecap='round'
            opacity='0.5'
        />
        <Line
            x1='20'
            y1='18'
            x2='23'
            y2='18'
            stroke={color}
            strokeWidth='2'
            strokeLinecap='round'
            opacity='0.3'
        />
    </Svg>
));

AudioPlayIcon.displayName = 'AudioPlayIcon';

// ============================================================================
// 6. COMPONENTE BADGE DE TIPO (Chip colorido)
// ============================================================================
/**
 * Badge/Chip para exibição de tipos com cor e texto legível
 * @param {Object} props
 * @param {string} props.typeName - Nome do tipo
 * @param {boolean} props.small - Modo compacto
 * @param {Function} props.onPress - Callback de toque (opcional)
 */
const TypeBadge = React.memo(({ typeName, small = false, onPress = null }) => {
    const language = useContext(LanguageContext);
    const normalizedType = normalizeText(typeName);
    const bgColor = getTypeColor(normalizedType);
    const textColor = getReadableTextColor(bgColor);

    const badgeStyles = [
        styles.typeBadge,
        { backgroundColor: bgColor },
        small && styles.typeBadgeSmall,
        onPress && styles.typeBadgePressable,
    ];

    const textStyles = [
        styles.typeBadgeText,
        { color: textColor },
        small && styles.typeBadgeTextSmall,
    ];

    const Content = (
        <View style={badgeStyles}>
            <Text style={textStyles}>{getLocalizedTypeName(normalizedType, language)}</Text>
        </View>
    );

    if (onPress) {
        return (
            <TouchableOpacity onPress={() => onPress(normalizedType)} activeOpacity={0.7}>
                {Content}
            </TouchableOpacity>
        );
    }

    return Content;
});

TypeBadge.displayName = 'TypeBadge';

// ============================================================================
// 7. FUNÇÃO: CALCULAR DEFESAS (Fraquezas/Resistências/Imunidades)
// ============================================================================
/**
 * Calcula efetividade de tipos contra um conjunto de tipos alvo
 * Implementa a tabela de tipos oficial da 9ª geração
 *
 * @param {Array} targetTypes - Array de objetos { type: { name: string } }
 * @returns {Promise<Object>} Objeto com weaknesses, resistances, immunities
 */
const calculateDefenses = async (targetTypes) => {
    // Inicializa multiplicadores base (1.0 = dano normal)
    const multipliers = {};
    Object.keys(TYPE_COLORS).forEach((type) => {
        multipliers[type] = 1.0;
    });

    // Processa cada tipo do Pokémon alvo
    for (const typeEntry of targetTypes) {
        const typeName = typeEntry.type?.name;
        if (!typeName) continue;

        try {
            // Busca dados do tipo na PokeAPI
            const response = await fetch(`${POKEAPI_BASE}/type/${typeName}`);
            if (!response.ok) continue;

            const typeData = await response.json();
            const relations = typeData.damage_relations;

            // Aplica multiplicadores: 2x = fraco, 0.5x = resistente, 0x = imune
            relations.double_damage_from?.forEach((t) => {
                multipliers[t.name] *= 2;
            });
            relations.half_damage_from?.forEach((t) => {
                multipliers[t.name] *= 0.5;
            });
            relations.no_damage_from?.forEach((t) => {
                multipliers[t.name] *= 0;
            });
        } catch (error) {
            console.warn(`Erro ao buscar tipo ${typeName}:`, error);
            // Continua com valores padrão em caso de erro
        }
    }

    // Categoriza tipos por multiplicador
    return {
        weaknesses: Object.keys(multipliers)
            .filter((t) => multipliers[t] >= 2)
            .sort((a, b) => multipliers[b] - multipliers[a]),
        resistances: Object.keys(multipliers)
            .filter((t) => multipliers[t] > 0 && multipliers[t] < 1)
            .sort((a, b) => multipliers[a] - multipliers[b]),
        immunities: Object.keys(multipliers)
            .filter((t) => multipliers[t] === 0)
            .sort(),
    };
};

// ============================================================================
// 8. FUNÇÃO: BUSCAR DADOS COMPLETOS DO POKÉMON
// ============================================================================
/**
 * Busca todos os dados de um Pokémon incluindo evoluções, megas, stats, etc.
 * Implementa cache básico e tratamento robusto de erros
 *
 * @param {string|number} nameOrId - Nome ou ID do Pokémon
 * @param {Object} options - Opções adicionais
 * @returns {Promise<Object|null>} Dados completos do Pokémon ou null
 */
const fetchFullDetails = async (nameOrId, options = {}) => {
    const {
        includeMegas = true,
        includeEvolutions = true,
        includeMoves = true,
        language = detectDeviceLanguage(),
    } = options;
    const normalizedLanguage = normalizeLanguageCode(language);

    try {
        // Normaliza query para busca
        const query = String(nameOrId).toLowerCase().trim();
        if (!query) throw new Error('Query vazia');

        // 1. Busca dados base do Pokémon
        const baseResponse = await fetch(`${POKEAPI_BASE}/pokemon/${query}`);
        if (!baseResponse.ok) throw new Error('Pokémon não encontrado');
        const baseData = await baseResponse.json();

        // 2. Busca dados da espécie (descrição, evolução, habitat, etc.)
        const specieResponse = await fetch(baseData.species.url);
        const specieData = await specieResponse.json();

        // 3. Extrai nome e descrição localizados para o idioma ativo
        const localizedSpeciesName =
            getLocalizedSpeciesName(specieData, normalizedLanguage) || baseData.name;
        const localizedDescription = await getLocalizedDescription(specieData, normalizedLanguage);
        const flavorEntry = specieData.flavor_text_entries.find(
            (e) =>
                normalizeLanguageCode(e.language?.name) === 'pt' ||
                normalizeLanguageCode(e.language?.name) === 'en'
        );
        const description = formatDescription(flavorEntry?.flavor_text) || localizedDescription;

        // 4. Calcula taxa de captura em porcentagem
        const captureRate = specieData.capture_rate || 45;
        const captureChance = ((captureRate / 255) * 100).toFixed(1);

        // 5. Calcula defesas do Pokémon base
        const baseDefenses = await calculateDefenses(baseData.types);

        // 6. Processa linha evolutiva (se solicitado)
        let evolutions = [];
        if (includeEvolutions && specieData.evolution_chain?.url) {
            try {
                const evoResponse = await fetch(specieData.evolution_chain.url);
                const evoData = await evoResponse.json();
                evolutions = parseEvolutionChain(evoData.chain);
            } catch (evoError) {
                console.warn('Erro ao buscar evolução:', evoError);
            }
        }

        // 7. Processa formas Mega/Primal (se solicitado)
        let megaForms = [];
        if (includeMegas && specieData.varieties?.length > 0) {
            const megaVarieties = specieData.varieties.filter(
                (v) =>
                    v.is_battle_only &&
                    (v.pokemon.name.includes('-mega') ||
                        v.pokemon.name.includes('-primal') ||
                        v.pokemon.name.includes('-ultra'))
            );

            if (megaVarieties.length > 0) {
                megaForms = await Promise.all(
                    megaVarieties.map(async (variety) => {
                        try {
                            const megaResponse = await fetch(variety.pokemon.url);
                            const megaData = await megaResponse.json();
                            const megaDefenses = await calculateDefenses(megaData.types);

                            return {
                                ...megaData,
                                isMega: true,
                                megaName: variety.pokemon.name,
                                ...megaDefenses,
                            };
                        } catch (megaError) {
                            console.warn(`Erro ao buscar mega ${variety.pokemon.name}:`, megaError);
                            return null;
                        }
                    })
                );
                megaForms = megaForms.filter(Boolean);
            }
        }

        // 8. Processa moves (se solicitado)
        let moves = [];
        if (includeMoves && baseData.moves?.length > 0) {
            moves = await getLocalizedMoves(baseData.moves, normalizedLanguage);
        }

        // 9. Extrai habilidades formatadas
        const abilities = baseData.abilities
            .map((a) => a.ability.name.replace('-', ' '))
            .map(capitalize);
        const localizedAbilities =
            normalizedLanguage === 'en'
                ? abilities
                : await Promise.all(
                      abilities.map(async (ability) =>
                          translateRemoteText(ability, 'en', normalizedLanguage)
                      )
                  );
        const localizedTypes = baseData.types.map((typeEntry) => ({
            ...typeEntry,
            type: {
                ...typeEntry.type,
                displayName: getLocalizedTypeName(typeEntry.type?.name, normalizedLanguage),
            },
        }));

        // 10. Monta objeto final com todos os dados
        return {
            // Dados base
            id: baseData.id,
            name: baseData.name,
            localizedLanguage: normalizedLanguage,
            localizedSpeciesName,
            types: baseData.types,
            localizedTypes,
            stats: baseData.stats.reduce((acc, stat) => {
                acc[stat.stat.name] = stat.base_stat;
                return acc;
            }, {}),
            height: baseData.height / 10, // Converte decimetres → metros
            weight: baseData.weight / 10, // Converte hectograms → kg

            // Dados da espécie
            description: localizedDescription || description,
            descriptionOriginal: description,
            habitat: specieData.habitat?.name || 'Desconhecido',
            captureRate,
            captureChance,
            abilities,
            localizedAbilities,
            localizedMoves: moves,

            // Dados calculados
            ...baseDefenses,

            // Dados relacionados
            evolutions,
            megas: megaForms,
            moves,

            // URLs de sprites para diferentes variantes
            sprites: {
                official: baseData.sprites.other?.['official-artwork']?.front_default,
                officialShiny: baseData.sprites.other?.['official-artwork']?.front_shiny,
                classic: baseData.sprites.front_default,
                classicShiny: baseData.sprites.front_shiny,
                home: baseData.sprites.other?.home?.front_default,
                homeShiny: baseData.sprites.other?.home?.front_shiny,
            },

            // URL do grito (se disponível)
            cry: `${AUDIO_CONFIG.baseUrl}/${baseData.id}${AUDIO_CONFIG.extension}`,
        };
    } catch (error) {
        console.error('Erro em fetchFullDetails:', error);
        throw error;
    }
};

/**
 * Parseia cadeia evolutiva recursivamente
 * @param {Object} chainNode - Nó da cadeia de evolução
 * @param {Array} result - Array acumulador (uso interno)
 * @returns {Array} Array de objetos { id, name, image }
 */
const parseEvolutionChain = (chainNode, result = []) => {
    if (!chainNode) return result;

    const speciesName = chainNode.species?.name;
    if (speciesName) {
        const id = extractIdFromUrl(chainNode.species.url);
        result.push({
            id,
            name: speciesName,
            image: `${SPRITES_BASE}/other/official-artwork/${id}.png`,
        });
    }

    // Recursão para próximos estágios
    if (chainNode.evolves_to?.length > 0) {
        parseEvolutionChain(chainNode.evolves_to[0], result);
    }

    return result;
};

// ============================================================================
// 9. FUNÇÃO: CARREGAR LISTA DE POKÉMON (Paginação)
// ============================================================================
/**
 * Carrega lista paginada de Pokémon da PokeAPI
 * Implementa cache e formatação consistente dos dados
 *
 * @param {number} offset - Offset para paginação
 * @param {number} limit - Limite de itens por página
 * @returns {Promise<Array>} Array de Pokémon formatados
 */
const loadPokemons = async (offset = 0, limit = POKEMON_BATCH_SIZE) => {
    try {
        const response = await fetch(`${POKEAPI_BASE}/pokemon?offset=${offset}&limit=${limit}`);
        if (!response.ok) throw new Error('Falha ao carregar lista');

        const data = await response.json();

        // Formata cada entrada com ID e URL de imagem
        return data.results.map((item) => {
            const id = extractIdFromUrl(item.url);
            return {
                id,
                name: item.name,
                url: item.url,
                image: `${SPRITES_BASE}/other/official-artwork/${id}.png`,
                imageShiny: `${SPRITES_BASE}/other/official-artwork/shiny/${id}.png`,
            };
        });
    } catch (error) {
        console.error('Erro em loadPokemons:', error);
        throw error;
    }
};

// ============================================================================
// 10. FUNÇÃO: BUSCA INTELIGENTE (Smart Search)
// ============================================================================
/**
 * Função de busca unificada que detecta automaticamente o tipo de query
 * Suporta: nome, ID, tipo (com aliases PT), geração (com aliases PT)
 *
 * @param {string} query - Termo de busca do usuário
 * @returns {Promise<Object>} Resultado da busca ou erro
 */
const smartSearch = async (query) => {
    const normalized = normalizeText(query);

    // 1. Verifica se é ID numérico
    if (/^\d+$/.test(normalized)) {
        const id = parseInt(normalized, 10);
        if (id >= 1 && id <= 1025) {
            return { type: 'id', value: id };
        }
    }

    // 2. Verifica se é tipo (com aliases em português)
    const resolvedType = resolveTypeName(normalized);
    if (TYPE_COLORS[resolvedType]) {
        return { type: 'type', value: resolvedType };
    }

    // 3. Verifica se é geração (com aliases em português)
    const resolvedGen = resolveGenerationQuery(normalized);
    if (GENERATION_RANGES[resolvedGen]) {
        return { type: 'generation', value: resolvedGen };
    }

    // 4. Default: trata como nome de Pokémon
    return { type: 'name', value: normalized };
};

// ============================================================================
// 11. FUNÇÃO: BUSCAR POR TIPO
// ============================================================================
/**
 * Busca todos os Pokémon de um tipo específico
 * @param {string} typeName - Nome do tipo em inglês
 * @returns {Promise<Array>} Lista de Pokémon do tipo
 */
const fetchPokemonByType = async (typeName) => {
    try {
        const response = await fetch(`${POKEAPI_BASE}/type/${typeName}`);
        if (!response.ok) throw new Error('Tipo não encontrado');

        const data = await response.json();

        // Ordena Pokémon por ID (ordem nacional da Pokédex)
        return data.pokemon
            .map((entry) => ({
                name: entry.pokemon.name,
                url: entry.pokemon.url,
                id: extractIdFromUrl(entry.pokemon.url),
            }))
            .sort((a, b) => a.id - b.id);
    } catch (error) {
        console.error(`Erro ao buscar tipo ${typeName}:`, error);
        throw error;
    }
};

// ============================================================================
// 12. FUNÇÃO: BUSCAR POR GERAÇÃO
// ============================================================================
/**
 * Busca todos os Pokémon de uma geração específica
 * @param {string} generationNum - Número da geração (1-9)
 * @returns {Promise<Array>} Lista de Pokémon da geração
 */
const fetchPokemonByGeneration = async (generationNum) => {
    try {
        const range = GENERATION_RANGES[generationNum];
        if (!range) throw new Error('Geração inválida');

        const response = await fetch(`${POKEAPI_BASE}/generation/${generationNum}`);
        if (!response.ok) throw new Error('Geração não encontrada');

        const data = await response.json();

        // Filtra e ordena espécies pelo ID
        return data.pokemon_species
            .map((species) => ({
                name: species.name,
                id: extractIdFromUrl(species.url),
            }))
            .filter((p) => p.id >= range.start && p.id <= range.end)
            .sort((a, b) => a.id - b.id);
    } catch (error) {
        console.error(`Erro ao buscar geração ${generationNum}:`, error);
        throw error;
    }
};

// ============================================================================
// 13. FUNÇÃO: GERENCIAR FAVORITOS (AsyncStorage)
// ============================================================================
const FAVORITES_KEY = '@pokedex_pro:favorites';

/**
 * Carrega lista de IDs favoritos do armazenamento local
 * @returns {Promise<Set<number>>} Set com IDs favoritos
 */
const loadFavorites = async () => {
    try {
        const stored = await AsyncStorage.getItem(FAVORITES_KEY);
        if (!stored) return new Set();
        const ids = JSON.parse(stored);
        return new Set(Array.isArray(ids) ? ids : []);
    } catch (error) {
        console.error('Erro ao carregar favoritos:', error);
        return new Set();
    }
};

/**
 * Salva lista de IDs favoritos no armazenamento local
 * @param {Set<number>} favorites - Set com IDs favoritos
 * @returns {Promise<void>}
 */
const saveFavorites = async (favorites) => {
    try {
        const ids = Array.from(favorites);
        await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
    } catch (error) {
        console.error('Erro ao salvar favoritos:', error);
    }
};

/**
 * Alterna status de favorito para um Pokémon
 * @param {number} pokemonId - ID do Pokémon
 * @param {Set<number>} currentFavorites - Set atual de favoritos
 * @returns {Promise<Set<number>>} Novo Set atualizado
 */
const toggleFavorite = async (pokemonId, currentFavorites) => {
    const newFavorites = new Set(currentFavorites);

    if (newFavorites.has(pokemonId)) {
        newFavorites.delete(pokemonId);
        // Feedback háptico sutil ao remover
        if (Haptics.impactAsync) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
    } else {
        newFavorites.add(pokemonId);
        // Feedback háptico mais forte ao adicionar
        if (Haptics.impactAsync) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        // Vibração breve em dispositivos que suportam
        if (Vibration.vibrate) {
            Vibration.vibrate(10);
        }
    }

    await saveFavorites(newFavorites);
    return newFavorites;
};

// ============================================================================
// 14. COMPONENTE PRINCIPAL: APP
// ============================================================================
export default function App() {
    const { width: windowWidth } = useWindowDimensions();
    // ==========================================================================
    // STATES PRINCIPAIS
    // ==========================================================================

    // Tema e aparência
    const [themeMode, setThemeMode] = useState('dark');
    const theme = useMemo(() => THEMES[themeMode], [themeMode]);

    // Idioma e localização
    const [language, setLanguage] = useState(detectDeviceLanguage());
    const languageInitializedRef = useRef(false);
    const currentLanguage = useMemo(() => normalizeLanguageCode(language), [language]);
    const t = useCallback(
        (key, params = {}) => translateUi(key, currentLanguage, params),
        [currentLanguage]
    );
    const languageMeta = LANGUAGE_OPTIONS[currentLanguage] || LANGUAGE_OPTIONS.pt;

    const responsiveListColumns = useMemo(
        () => (windowWidth >= 1000 ? 4 : windowWidth >= 720 ? 3 : windowWidth >= 360 ? 2 : 1),
        [windowWidth]
    );
    const responsiveGridCardWidth = useMemo(
        () =>
            windowWidth < 360
                ? '100%'
                : windowWidth >= 1200
                  ? '23%'
                  : windowWidth >= 900
                    ? '31%'
                    : '48%',
        [windowWidth]
    );
    const responsiveDetailImageSize = useMemo(
        () =>
            windowWidth >= 1000
                ? 320
                : windowWidth >= 600
                  ? 300
                  : Math.min(windowWidth * 0.74, 280),
        [windowWidth]
    );
    const responsiveRadarSize = useMemo(
        () => (windowWidth >= 1000 ? 260 : windowWidth >= 600 ? 240 : 220),
        [windowWidth]
    );

    // Navegação entre tabs
    const [activeTab, setActiveTab] = useState('lista'); // 'lista' | 'busca' | 'favoritos'

    // Estados da lista principal
    const [pokemonList, setPokemonList] = useState([]);
    const [listOffset, setListOffset] = useState(INITIAL_OFFSET);
    const [listLoading, setListLoading] = useState(false);
    const [listLoadingMore, setListLoadingMore] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Estados da busca avançada
    const [searchQuery, setSearchQuery] = useState('');
    const [searchMode, setSearchMode] = useState('name'); // 'name' | 'type' | 'generation' | 'id'
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState(null);

    // Estados do detalhe do Pokémon
    const [selectedPokemon, setSelectedPokemon] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState(null);

    // Estados de visualização do Pokémon
    const [isShiny, setIsShiny] = useState(false);
    const [activeFormIndex, setActiveFormIndex] = useState(-1); // -1 = Base, 0+ = Megas
    const [imageVariant, setImageVariant] = useState('official');

    // Estados de favoritos
    const [favorites, setFavorites] = useState(new Set());
    const [favoritesList, setFavoritesList] = useState([]);
    const [favoritesLoading, setFavoritesLoading] = useState(false);

    // Estados de áudio
    const soundRef = useRef(null);
    const [audioLoadingId, setAudioLoadingId] = useState(null);

    // Refs para animações e performance
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const listRef = useRef(null);

    const cycleLanguage = useCallback(() => {
        setLanguage((current) => {
            const normalized = normalizeLanguageCode(current);
            const index = SUPPORTED_LANGUAGES.indexOf(normalized);
            const nextIndex = index === -1 ? 0 : (index + 1) % SUPPORTED_LANGUAGES.length;
            return SUPPORTED_LANGUAGES[nextIndex];
        });
    }, []);

    // ==========================================================================
    // EFEITOS (useEffect)
    // ==========================================================================

    // Carrega idioma salvo ou detectado automaticamente
    useEffect(() => {
        const initLanguage = async () => {
            try {
                const storedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
                const preferredLanguage = normalizeLanguageCode(
                    storedLanguage || detectDeviceLanguage()
                );
                setLanguage(preferredLanguage);
            } finally {
                languageInitializedRef.current = true;
            }
        };
        initLanguage();
    }, []);

    // Persiste o idioma escolhido depois da inicialização
    useEffect(() => {
        if (!languageInitializedRef.current) return;
        AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, currentLanguage).catch(console.warn);
    }, [currentLanguage]);

    // Carrega favoritos ao montar o componente
    useEffect(() => {
        const initFavorites = async () => {
            const loaded = await loadFavorites();
            setFavorites(loaded);
        };
        initFavorites();
    }, []);

    // Carrega lista inicial de Pokémon
    useEffect(() => {
        if (activeTab === 'lista') {
            loadInitialList();
        }
    }, [activeTab]);

    // Atualiza lista de favoritos quando a tab é ativada
    useEffect(() => {
        if (activeTab === 'favoritos') {
            loadFavoritesList();
        }
    }, [activeTab, favorites, currentLanguage]);

    // Recarrega o detalhe aberto quando o idioma muda
    useEffect(() => {
        if (!selectedPokemon?.id) return;
        if (selectedPokemon.localizedLanguage === currentLanguage) return;

        const refreshLocalizedDetail = async () => {
            try {
                const refreshed = await fetchFullDetails(selectedPokemon.id, {
                    includeMegas: true,
                    includeEvolutions: true,
                    includeMoves: true,
                    language: currentLanguage,
                });
                setSelectedPokemon(refreshed);
            } catch (error) {
                console.warn('Erro ao atualizar tradução do detalhe:', error);
            }
        };

        refreshLocalizedDetail();
    }, [currentLanguage, selectedPokemon?.id]);

    // Cleanup de áudio ao desmontar
    useEffect(() => {
        return () => {
            if (soundRef.current) {
                soundRef.current.unloadAsync().catch(console.warn);
                soundRef.current = null;
            }
        };
    }, []);

    // ==========================================================================
    // HANDLERS E FUNÇÕES DE AÇÃO
    // ==========================================================================

    /**
     * Carrega lista inicial de Pokémon (primeira página)
     */
    const loadInitialList = useCallback(async () => {
        if (listLoading) return;

        try {
            setListLoading(true);
            setPokemonList([]);
            setListOffset(INITIAL_OFFSET);

            const initialBatch = await loadPokemons(INITIAL_OFFSET, POKEMON_BATCH_SIZE);
            setPokemonList(initialBatch);
            setListOffset(INITIAL_OFFSET + POKEMON_BATCH_SIZE);
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível carregar a lista de Pokémon.');
            console.error('Erro em loadInitialList:', error);
        } finally {
            setListLoading(false);
        }
    }, [listLoading]);

    /**
     * Carrega mais Pokémon para infinite scroll
     */
    const loadMorePokemons = useCallback(async () => {
        if (listLoadingMore || listLoading) return;

        try {
            setListLoadingMore(true);
            const nextBatch = await loadPokemons(listOffset, POKEMON_BATCH_SIZE);

            if (nextBatch.length > 0) {
                setPokemonList((prev) => [...prev, ...nextBatch]);
                setListOffset((prev) => prev + POKEMON_BATCH_SIZE);
            }
        } catch (error) {
            console.warn('Erro ao carregar mais Pokémon:', error);
        } finally {
            setListLoadingMore(false);
        }
    }, [listLoadingMore, listLoading, listOffset]);

    /**
     * Handler para Pull-to-Refresh
     */
    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadInitialList();
        setRefreshing(false);
    }, [loadInitialList]);

    /**
     * Busca Pokémon por query (nome, ID, tipo ou geração)
     */
    const handleSmartSearch = useCallback(async () => {
        if (!searchQuery.trim()) {
            setSearchError(t('search.errorEmpty'));
            return;
        }

        Keyboard.dismiss();
        setSearchLoading(true);
        setSearchError(null);
        setSearchResults([]);

        try {
            const searchType = await smartSearch(searchQuery);
            let results = [];

            switch (searchType.type) {
                case 'id':
                case 'name':
                    // Busca Pokémon específico
                    const pokemon = await fetchFullDetails(searchType.value, {
                        language: currentLanguage,
                    });
                    if (pokemon) {
                        results = [pokemon];
                    } else {
                        throw new Error(t('search.errorNotFound'));
                    }
                    break;

                case 'type':
                    // Busca por tipo
                    const pokemonByType = await fetchPokemonByType(searchType.value);
                    const detailedByType = await Promise.all(
                        pokemonByType.slice(0, 20).map(async (p) => {
                            try {
                                return await fetchFullDetails(p.name, {
                                    includeEvolutions: false,
                                    includeMoves: false,
                                    language: currentLanguage,
                                });
                            } catch {
                                return null;
                            }
                        })
                    );
                    results = detailedByType.filter(Boolean);
                    break;

                case 'generation':
                    // Busca por geração
                    const pokemonByGen = await fetchPokemonByGeneration(searchType.value);
                    const detailedByGen = await Promise.all(
                        pokemonByGen.slice(0, 20).map(async (p) => {
                            try {
                                return await fetchFullDetails(p.name, {
                                    includeEvolutions: false,
                                    includeMoves: false,
                                    language: currentLanguage,
                                });
                            } catch {
                                return null;
                            }
                        })
                    );
                    results = detailedByGen.filter(Boolean);
                    break;
            }

            setSearchResults(results);

            if (results.length === 0) {
                setSearchError(t('search.errorNotFound'));
            }
        } catch (error) {
            setSearchError(error.message || t('common.networkError'));
            console.error('Erro em handleSmartSearch:', error);
        } finally {
            setSearchLoading(false);
        }
    }, [searchQuery, currentLanguage, t]);

    /**
     * Abre tela de detalhe de um Pokémon
     */
    const openPokemonDetail = useCallback(
        async (pokemonIdOrName) => {
            setDetailLoading(true);
            setDetailError(null);
            setIsShiny(false);
            setActiveFormIndex(-1);

            try {
                const pokemon = await fetchFullDetails(pokemonIdOrName, {
                    language: currentLanguage,
                });
                setSelectedPokemon(pokemon);
                setActiveTab('lista'); // Volta para tab de lista ao abrir detalhe
            } catch (error) {
                setDetailError(t('common.networkError'));
                Alert.alert(t('common.notFound'), t('common.networkError'));
                console.error('Erro em openPokemonDetail:', error);
            } finally {
                setDetailLoading(false);
            }
        },
        [currentLanguage, t]
    );

    /**
     * Alterna forma Mega/Primal do Pokémon
     */
    const toggleMegaForm = useCallback(() => {
        if (!selectedPokemon?.megas?.length) return;

        let nextIndex = activeFormIndex + 1;
        if (nextIndex >= selectedPokemon.megas.length) {
            nextIndex = -1; // Volta para forma base
        }

        setActiveFormIndex(nextIndex);

        // Feedback háptico ao alternar forma
        if (Haptics.selectionAsync) {
            Haptics.selectionAsync();
        }
    }, [selectedPokemon, activeFormIndex]);

    /**
     * Toca o grito do Pokémon atual
     */
    const playPokemonCry = useCallback(async () => {
        const currentPokemon =
            activeFormIndex === -1 ? selectedPokemon : selectedPokemon?.megas?.[activeFormIndex];

        if (!currentPokemon?.cry) {
            Alert.alert('Áudio indisponível', 'Este Pokémon não possui grito de áudio disponível.');
            return;
        }

        try {
            setAudioLoadingId(currentPokemon.id);

            // Para áudio anterior se existir
            if (soundRef.current) {
                await soundRef.current.stopAsync();
                await soundRef.current.unloadAsync();
                soundRef.current = null;
            }

            // Carrega e toca novo áudio
            const { sound } = await Audio.Sound.createAsync(
                { uri: currentPokemon.cry },
                { shouldPlay: true, volume: 0.8 }
            );

            soundRef.current = sound;

            // Callback para cleanup automático ao terminar
            sound.setOnPlaybackStatusUpdate(async (status) => {
                if (status.isLoaded && status.didJustFinish) {
                    await sound.unloadAsync();
                    if (soundRef.current === sound) {
                        soundRef.current = null;
                    }
                    setAudioLoadingId(null);
                }
            });
        } catch (audioError) {
            console.error('Erro ao tocar áudio:', audioError);
            Alert.alert('Erro de áudio', 'Não foi possível reproduzir o grito.');
        } finally {
            setAudioLoadingId(null);
        }
    }, [selectedPokemon, activeFormIndex]);

    /**
     * Alterna favorito de um Pokémon
     */
    const handleToggleFavorite = useCallback(
        async (pokemonId) => {
            const newFavorites = await toggleFavorite(pokemonId, favorites);
            setFavorites(newFavorites);
        },
        [favorites]
    );

    /**
     * Carrega lista de favoritos para exibição
     */
    const loadFavoritesList = useCallback(async () => {
        if (favoritesLoading || favorites.size === 0) {
            setFavoritesList([]);
            return;
        }

        try {
            setFavoritesLoading(true);
            const detailedFavorites = await Promise.all(
                Array.from(favorites).map(async (id) => {
                    try {
                        return await fetchFullDetails(id, {
                            includeEvolutions: false,
                            includeMoves: false,
                            language: currentLanguage,
                        });
                    } catch {
                        return null;
                    }
                })
            );
            setFavoritesList(detailedFavorites.filter(Boolean));
        } catch (error) {
            console.error('Erro ao carregar lista de favoritos:', error);
        } finally {
            setFavoritesLoading(false);
        }
    }, [favorites, favoritesLoading, currentLanguage]);

    /**
     * Fecha tela de detalhe e limpa estados
     */
    const closePokemonDetail = useCallback(() => {
        setSelectedPokemon(null);
        setIsShiny(false);
        setActiveFormIndex(-1);
        setDetailError(null);

        // Para áudio se estiver tocando
        if (soundRef.current) {
            soundRef.current.stopAsync().catch(console.warn);
        }
    }, []);

    // ==========================================================================
    // FUNÇÕES DE RENDERIZAÇÃO AUXILIARES
    // ==========================================================================

    /**
     * Obtém URL da imagem correta baseada em variant, shiny e forma
     */
    const getImageUrl = useCallback(() => {
        const pokemon =
            activeFormIndex === -1 ? selectedPokemon : selectedPokemon?.megas?.[activeFormIndex];

        if (!pokemon?.sprites) return DEFAULT_IMAGE;

        const sprites = pokemon.sprites;
        const variant = IMAGE_VARIANTS[imageVariant];

        // Tenta prioridades da variante
        for (const key of variant.priority) {
            const url = key.split('.').reduce((obj, k) => obj?.[k], sprites);
            if (url && (isShiny ? key.includes('shiny') : !key.includes('shiny'))) {
                return url;
            }
        }

        // Fallback para imagem padrão
        return sprites.official || DEFAULT_IMAGE;
    }, [selectedPokemon, activeFormIndex, isShiny, imageVariant]);

    /**
     * Renderiza card de Pokémon para listas (grid)
     */
    const renderPokemonCard = useCallback(
        ({ item, isFavoriteList = false }) => {
            const pokemon = item;
            const isFavorite = favorites.has(pokemon.id);
            const primaryType = pokemon.types?.[0]?.type?.name || 'normal';
            const typeColor = getTypeColor(primaryType);

            return (
                <TouchableOpacity
                    style={[
                        styles.gridItem,
                        {
                            backgroundColor: theme.card,
                            borderTopColor: typeColor,
                            borderTopWidth: 4,
                        },
                    ]}
                    onPress={() => openPokemonDetail(pokemon.id || pokemon.name)}
                    activeOpacity={0.85}>
                    {/* Badge de favorito */}
                    <TouchableOpacity
                        style={[styles.favoriteBadge, { right: 8, top: 8 }]}
                        onPress={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(pokemon.id);
                        }}
                        activeOpacity={0.7}>
                        <Text
                            style={[
                                styles.favoriteIcon,
                                {
                                    color: isFavorite
                                        ? theme.favoriteActive
                                        : theme.favoriteInactive,
                                },
                            ]}>
                            {isFavorite ? '♥' : '♡'}
                        </Text>
                    </TouchableOpacity>

                    {/* Imagem do Pokémon */}
                    <View style={styles.gridImageContainer}>
                        <ExpoImage
                            source={{ uri: pokemon.image || DEFAULT_IMAGE }}
                            style={styles.gridImage}
                            contentFit='contain'
                            transition={200}
                            cachePolicy='memory-disk'
                        />
                    </View>

                    {/* ID e nome */}
                    <Text style={[styles.gridId, { color: theme.mutedText }]}>
                        #{formatId(pokemon.id)}
                    </Text>
                    <Text style={[styles.gridName, { color: theme.textPrimary }]}>
                        {pokemon.localizedSpeciesName || capitalize(pokemon.name)}
                    </Text>

                    {/* Chips de tipos */}
                    {pokemon.types?.length > 0 && (
                        <View style={styles.gridTypesRow}>
                            {pokemon.types.slice(0, 2).map((typeEntry, idx) => (
                                <TypeBadge key={idx} typeName={typeEntry.type.name} small />
                            ))}
                        </View>
                    )}
                </TouchableOpacity>
            );
        },
        [theme, favorites, openPokemonDetail, handleToggleFavorite]
    );

    /**
     * Renderiza skeleton loading para cards
     */
    const renderSkeletonCard = useCallback(
        () => (
            <View style={[styles.gridItem, { backgroundColor: theme.card, borderTopWidth: 4 }]}>
                <View style={[styles.gridImageContainer, { backgroundColor: theme.infoBg }]} />
                <View style={[styles.skeletonText, { backgroundColor: theme.infoBg, width: 60 }]} />
                <View
                    style={[
                        styles.skeletonText,
                        { backgroundColor: theme.infoBg, width: 100, marginTop: 4 },
                    ]}
                />
                <View style={styles.gridTypesRow}>
                    <View style={[styles.skeletonBadge, { backgroundColor: theme.infoBg }]} />
                    <View style={[styles.skeletonBadge, { backgroundColor: theme.infoBg }]} />
                </View>
            </View>
        ),
        [theme]
    );

    /**
     * Renderiza header clássico da Pokédex
     */
    const renderHeader = useCallback(
        () => (
            <View style={styles.headerContainer}>
                {/* Gradiente do header */}
                <LinearGradient
                    colors={[theme.headerGradientStart, theme.headerGradientEnd]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.headerGradient}
                />

                {/* Lente da Pokédex (círculo azul com reflexo) */}
                <View style={styles.pokedexLensContainer}>
                    <View style={styles.pokedexLens}>
                        <View style={styles.lensReflection} />
                        <View style={styles.lensInnerGlow} />
                    </View>
                    <View style={styles.lensScrew} />
                </View>

                {/* Título POKÉDEX PRO */}
                <View style={styles.headerTitleWrap}>
                    <Text style={styles.headerTitle}>{t('appTitle')}</Text>
                    <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
                        Retro Mode
                    </Text>
                </View>

                {/* Botão de idioma e badge de versão */}
                <TouchableOpacity
                    style={[
                        styles.languageBadge,
                        { backgroundColor: theme.surface, borderColor: theme.border },
                    ]}
                    onPress={cycleLanguage}
                    activeOpacity={0.85}>
                    <Text style={[styles.languageBadgeText, { color: theme.textSecondary }]}>
                        🌐 {languageMeta.label}
                    </Text>
                </TouchableOpacity>

                <View style={styles.versionBadge}>
                    <Text style={styles.versionText}>{t('version')}</Text>
                </View>
            </View>
        ),
        [theme, t, cycleLanguage, languageMeta]
    );

    /**
     * Renderiza tabs de navegação
     */
    const renderTabs = useCallback(() => {
        const tabs = [
            { key: 'lista', label: t('tabs.list'), icon: '📋' },
            { key: 'busca', label: t('tabs.search'), icon: '🔍' },
            { key: 'favoritos', label: t('tabs.favorites'), icon: '❤️' },
        ];

        return (
            <View
                style={[
                    styles.tabsContainer,
                    {
                        backgroundColor:
                            themeMode === 'dark' ? 'rgba(15,23,42,0.95)' : 'rgba(248,250,252,0.96)',
                        borderBottomColor: theme.border,
                    },
                ]}>
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.key;
                    return (
                        <TouchableOpacity
                            key={tab.key}
                            style={[
                                styles.tabButton,
                                isActive && styles.tabButtonActive,
                                { backgroundColor: isActive ? theme.tabActive : theme.tabBg },
                            ]}
                            onPress={() => setActiveTab(tab.key)}
                            activeOpacity={0.8}>
                            <Text
                                style={[
                                    styles.tabText,
                                    { color: isActive ? theme.activeText : theme.tabInactive },
                                ]}>
                                {tab.icon} {tab.label}
                            </Text>
                            {isActive && <View style={styles.tabIndicator} />}
                        </TouchableOpacity>
                    );
                })}
            </View>
        );
    }, [activeTab, theme, themeMode, t]);

    /**
     * Renderiza seção de busca avançada
     */
    const renderAdvancedSearch = useCallback(
        () => (
            <View style={[styles.searchSection, { backgroundColor: theme.card }]}>
                {/* Selector de modo de busca */}
                <View style={styles.searchModeRow}>
                    {[
                        {
                            key: 'name',
                            label: t('search.modeName'),
                            placeholder: t('search.placeholderName'),
                        },
                        {
                            key: 'type',
                            label: t('search.modeType'),
                            placeholder: t('search.placeholderType'),
                        },
                        {
                            key: 'generation',
                            label: t('search.modeGeneration'),
                            placeholder: t('search.placeholderGeneration'),
                        },
                        {
                            key: 'id',
                            label: t('search.modeId'),
                            placeholder: t('search.placeholderId'),
                        },
                    ].map((mode) => (
                        <TouchableOpacity
                            key={mode.key}
                            style={[
                                styles.searchModeButton,
                                searchMode === mode.key && styles.searchModeButtonActive,
                                {
                                    backgroundColor:
                                        searchMode === mode.key
                                            ? theme.buttonPrimary
                                            : theme.surface,
                                    borderColor: theme.border,
                                },
                            ]}
                            onPress={() => setSearchMode(mode.key)}
                            activeOpacity={0.8}>
                            <Text
                                style={[
                                    styles.searchModeButtonText,
                                    {
                                        color:
                                            searchMode === mode.key
                                                ? theme.buttonPrimaryText
                                                : theme.mutedText,
                                    },
                                ]}>
                                {mode.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={[styles.searchHelpText, { color: theme.mutedText }]}>
                    {t('search.heroDescription')}
                </Text>

                {/* Input de busca */}
                <View style={styles.searchInputRow}>
                    <TextInput
                        style={[
                            styles.searchInput,
                            {
                                backgroundColor: theme.inputBg,
                                color: theme.text,
                                borderColor: theme.inputBorder,
                                placeholderTextColor: theme.inputPlaceholder,
                            },
                        ]}
                        placeholder={
                            searchMode === 'name'
                                ? t('search.placeholderName')
                                : searchMode === 'type'
                                  ? t('search.placeholderType')
                                  : searchMode === 'generation'
                                    ? t('search.placeholderGeneration')
                                    : t('search.placeholderId')
                        }
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={handleSmartSearch}
                        returnKeyType='search'
                        autoCapitalize='none'
                        autoCorrect={false}
                        selectTextOnFocus
                    />
                    <TouchableOpacity
                        style={[styles.searchButton, { backgroundColor: theme.buttonPrimary }]}
                        onPress={handleSmartSearch}
                        disabled={searchLoading}
                        activeOpacity={0.85}>
                        {searchLoading ? (
                            <ActivityIndicator size='small' color={theme.buttonPrimaryText} />
                        ) : (
                            <Text
                                style={[
                                    styles.searchButtonText,
                                    { color: theme.buttonPrimaryText },
                                ]}>
                                {t('search.buttonSearch')}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Selector de variante de imagem (apenas para busca por nome/ID) */}
                {(searchMode === 'name' || searchMode === 'id') && (
                    <View style={styles.variantSelector}>
                        <Text style={[styles.variantLabel, { color: theme.mutedText }]}>
                            {t('search.imageLabel')}:
                        </Text>
                        {Object.entries(IMAGE_VARIANTS).map(([key, variant]) => (
                            <TouchableOpacity
                                key={key}
                                style={[
                                    styles.variantButton,
                                    imageVariant === key && styles.variantButtonActive,
                                    {
                                        backgroundColor:
                                            imageVariant === key
                                                ? theme.buttonPrimary
                                                : theme.surface,
                                        borderColor: theme.border,
                                    },
                                ]}
                                onPress={() => setImageVariant(key)}
                                activeOpacity={0.8}>
                                <Text
                                    style={[
                                        styles.variantButtonText,
                                        {
                                            color:
                                                imageVariant === key
                                                    ? theme.buttonPrimaryText
                                                    : theme.mutedText,
                                        },
                                    ]}>
                                    {variant.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Mensagem de erro */}
                {searchError && (
                    <View
                        style={[
                            styles.errorMessage,
                            { backgroundColor: theme.errorBg, borderColor: theme.border },
                        ]}>
                        <Text style={[styles.errorText, { color: theme.textSecondary }]}>
                            {searchError}
                        </Text>
                    </View>
                )}

                {/* Resultados da busca */}
                {searchResults.length > 0 && !searchLoading && (
                    <View style={styles.searchResultsHeader}>
                        <Text style={[styles.searchResultsCount, { color: theme.textPrimary }]}>
                            {t('search.resultsCount', { count: searchResults.length })}
                        </Text>
                    </View>
                )}
            </View>
        ),
        [
            theme,
            searchMode,
            searchQuery,
            searchLoading,
            searchError,
            searchResults,
            imageVariant,
            handleSmartSearch,
        ]
    );

    /**
     * Renderiza tela de detalhe do Pokémon (fullscreen)
     */
    const renderPokemonDetail = useCallback(() => {
        if (detailLoading) {
            return (
                <View style={[styles.detailContainer, { backgroundColor: theme.screen }]}>
                    <ActivityIndicator
                        size='large'
                        color={theme.buttonPrimary}
                        style={{ marginTop: 100 }}
                    />
                    <Text style={[styles.loadingText, { color: theme.mutedText }]}>
                        {t('common.loading')}
                    </Text>
                </View>
            );
        }

        if (detailError || !selectedPokemon) {
            return (
                <View style={[styles.detailContainer, { backgroundColor: theme.screen }]}>
                    <Text style={[styles.errorText, { color: theme.textSecondary }]}>
                        {detailError || t('common.notFound')}
                    </Text>
                    <TouchableOpacity
                        style={[styles.retryButton, { backgroundColor: theme.buttonSecondary }]}
                        onPress={closePokemonDetail}
                        activeOpacity={0.8}>
                        <Text
                            style={[styles.retryButtonText, { color: theme.buttonSecondaryText }]}>
                            ← Voltar
                        </Text>
                    </TouchableOpacity>
                </View>
            );
        }

        // Pokémon ativo (base ou mega)
        const activePokemon =
            activeFormIndex === -1 ? selectedPokemon : selectedPokemon.megas?.[activeFormIndex];

        if (!activePokemon) return null;

        const displayName =
            activePokemon.localizedSpeciesName || capitalize(activePokemon.name.replace(/-/g, ' '));
        const localizedDescription =
            activePokemon.description ||
            activePokemon.descriptionOriginal ||
            t('common.noDescription');
        const localizedAbilities =
            activePokemon.localizedAbilities || activePokemon.abilities || [];
        const localizedMoves = activePokemon.localizedMoves || activePokemon.moves || [];

        const primaryType = activePokemon.types?.[0]?.type?.name || 'normal';
        const typeColor = getTypeColor(primaryType);
        const isMegaActive = activeFormIndex !== -1;

        return (
            <ScrollView
                style={[styles.detailContainer, { backgroundColor: theme.screen }]}
                contentContainerStyle={styles.detailContent}
                showsVerticalScrollIndicator={false}
                bounces={false}>
                {/* Header do detalhe */}
                <View style={styles.detailHeader}>
                    <TouchableOpacity
                        style={[
                            styles.backButton,
                            { backgroundColor: theme.surface, borderColor: theme.border },
                        ]}
                        onPress={closePokemonDetail}
                        activeOpacity={0.8}>
                        <Text style={[styles.backButtonText, { color: theme.textPrimary }]}>
                            ← {t('detail.back')}
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.detailTitleRow}>
                        <Text
                            style={[
                                styles.detailPokemonName,
                                { color: theme.textPrimary },
                                isMegaActive && { color: '#8B5CF6' },
                            ]}>
                            {displayName}
                        </Text>
                        <Text style={[styles.detailPokemonId, { color: theme.mutedText }]}>
                            #{formatId(activePokemon.id)}
                        </Text>
                    </View>

                    {/* Tipos principais */}
                    <View style={styles.detailTypesRow}>
                        {activePokemon.types?.map((typeEntry, idx) => (
                            <TypeBadge key={idx} typeName={typeEntry.type.name} />
                        ))}
                    </View>
                </View>

                {/* Bloco de imagem e controles */}
                <View style={styles.detailImageBlock}>
                    {/* Imagem principal */}
                    <View
                        style={[
                            styles.detailImageContainer,
                            {
                                width: responsiveDetailImageSize,
                                height: responsiveDetailImageSize,
                            },
                        ]}>
                        <ExpoImage
                            source={{ uri: getImageUrl() }}
                            style={styles.detailPokemonImage}
                            contentFit='contain'
                            transition={300}
                            cachePolicy='memory-disk'
                        />
                        {/* Efeito de brilho para shiny */}
                        {isShiny && (
                            <View style={styles.shinySparkle}>
                                <Text style={styles.shinySparkleText}>✨</Text>
                            </View>
                        )}
                    </View>

                    {/* Botões de ação: Shiny, Mega, Áudio */}
                    <View style={styles.detailActionButtons}>
                        {/* Toggle Shiny */}
                        <TouchableOpacity
                            style={[
                                styles.actionButton,
                                isShiny && styles.actionButtonActive,
                                {
                                    backgroundColor: isShiny ? '#FCD34D' : theme.surface,
                                    borderColor: theme.border,
                                },
                            ]}
                            onPress={() => setIsShiny((prev) => !prev)}
                            activeOpacity={0.8}>
                            <Text
                                style={[
                                    styles.actionButtonText,
                                    { color: isShiny ? '#111827' : theme.mutedText },
                                ]}>
                                {isShiny ? `✨ ${t('detail.shiny')}` : `🌟 ${t('detail.shiny')}`}
                            </Text>
                        </TouchableOpacity>

                        {/* Toggle Mega/Primal */}
                        {selectedPokemon.megas?.length > 0 && (
                            <TouchableOpacity
                                style={[
                                    styles.actionButton,
                                    isMegaActive && styles.actionButtonActive,
                                    {
                                        backgroundColor: isMegaActive ? '#8B5CF6' : theme.surface,
                                        borderColor: theme.border,
                                    },
                                ]}
                                onPress={toggleMegaForm}
                                activeOpacity={0.8}>
                                <Text
                                    style={[
                                        styles.actionButtonText,
                                        { color: isMegaActive ? '#FFFFFF' : theme.mutedText },
                                    ]}>
                                    {isMegaActive
                                        ? `🧬 ${t('detail.mega')}`
                                        : `🧬 ${t('detail.mega')}`}
                                </Text>
                            </TouchableOpacity>
                        )}

                        {/* Botão de áudio (grito) */}
                        <TouchableOpacity
                            style={[
                                styles.actionButton,
                                { backgroundColor: '#22C55E', borderColor: '#16A34A' },
                            ]}
                            onPress={playPokemonCry}
                            disabled={audioLoadingId === activePokemon.id}
                            activeOpacity={0.85}>
                            {audioLoadingId === activePokemon.id ? (
                                <ActivityIndicator size='small' color='#FFFFFF' />
                            ) : (
                                <AudioPlayIcon color='#FFFFFF' />
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Info de shiny rate ou capture rate */}
                    <View style={[styles.detailInfoBadge, { backgroundColor: theme.infoBg }]}>
                        <Text style={[styles.detailInfoText, { color: theme.mutedText }]}>
                            {isShiny
                                ? t('detail.shinyRate')
                                : `${t('detail.capturePrefix')}${activePokemon.captureChance}%`}
                        </Text>
                    </View>
                </View>

                {/* Descrição e informações básicas */}
                <View
                    style={[
                        styles.detailSection,
                        { backgroundColor: theme.card, borderColor: theme.border },
                    ]}>
                    <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                        {isMegaActive ? t('detail.statsMega') : t('detail.description')}
                    </Text>
                    <Text style={[styles.descriptionText, { color: theme.textSecondary }]}>
                        {localizedDescription}
                    </Text>

                    {/* Grid de informações */}
                    <View style={styles.detailInfoGrid}>
                        <View
                            style={[
                                styles.detailInfoItem,
                                { backgroundColor: theme.infoBg, borderColor: theme.border },
                            ]}>
                            <Text style={[styles.detailInfoLabel, { color: theme.mutedText }]}>
                                {t('detail.height')}
                            </Text>
                            <Text style={[styles.detailInfoValue, { color: theme.textPrimary }]}>
                                {activePokemon.height} m
                            </Text>
                        </View>
                        <View
                            style={[
                                styles.detailInfoItem,
                                { backgroundColor: theme.infoBg, borderColor: theme.border },
                            ]}>
                            <Text style={[styles.detailInfoLabel, { color: theme.mutedText }]}>
                                {t('detail.weight')}
                            </Text>
                            <Text style={[styles.detailInfoValue, { color: theme.textPrimary }]}>
                                {activePokemon.weight} kg
                            </Text>
                        </View>
                        <View
                            style={[
                                styles.detailInfoItem,
                                { backgroundColor: theme.infoBg, borderColor: theme.border },
                            ]}>
                            <Text style={[styles.detailInfoLabel, { color: theme.mutedText }]}>
                                {t('detail.habitat')}
                            </Text>
                            <Text style={[styles.detailInfoValue, { color: theme.textPrimary }]}>
                                {capitalize(activePokemon.habitat)}
                            </Text>
                        </View>
                    </View>

                    {/* Habilidades */}
                    {localizedAbilities?.length > 0 && (
                        <View style={styles.abilitiesRow}>
                            <Text style={[styles.abilitiesLabel, { color: theme.mutedText }]}>
                                {t('detail.abilities')}:
                            </Text>
                            <View style={styles.abilitiesChips}>
                                {localizedAbilities.map((ability, idx) => (
                                    <View
                                        key={idx}
                                        style={[
                                            styles.abilityChip,
                                            { backgroundColor: theme.badgeBg },
                                        ]}>
                                        <Text
                                            style={[
                                                styles.abilityChipText,
                                                { color: theme.textSecondary },
                                            ]}>
                                            {ability}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}
                </View>

                {/* Radar Chart de Stats */}
                <View
                    style={[
                        styles.detailSection,
                        { backgroundColor: theme.card, borderColor: theme.border },
                    ]}>
                    <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                        {isMegaActive ? t('detail.statsMega') : t('detail.statsBase')}
                    </Text>
                    <RadarChart
                        stats={activePokemon.stats}
                        color={typeColor}
                        theme={theme}
                        size={responsiveRadarSize}
                    />

                    {/* Lista de stats com valores */}
                    <View style={styles.statsList}>
                        {STAT_KEYS.map((statKey) => {
                            const value = activePokemon.stats?.[statKey] || 0;
                            const percentage = Math.min((value / STAT_MAX_VALUE) * 100, 100);
                            return (
                                <View key={statKey} style={styles.statRow}>
                                    <Text style={[styles.statLabel, { color: theme.mutedText }]}>
                                        {getLocalizedStatLabel(statKey, currentLanguage)}
                                    </Text>
                                    <Text style={[styles.statValue, { color: theme.textPrimary }]}>
                                        {String(value).padStart(3, '0')}
                                    </Text>
                                    <View
                                        style={[
                                            styles.statBarBg,
                                            { backgroundColor: theme.infoBg },
                                        ]}>
                                        <View
                                            style={[
                                                styles.statBarFill,
                                                {
                                                    width: `${percentage}%`,
                                                    backgroundColor: typeColor,
                                                    opacity: 0.9,
                                                },
                                            ]}
                                        />
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </View>

                {/* Seção de Efetividade (Fraquezas/Resistências/Imunidades) */}
                <View
                    style={[
                        styles.detailSection,
                        { backgroundColor: theme.card, borderColor: theme.border },
                    ]}>
                    <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                        {t('detail.effectiveness')}
                    </Text>

                    {/* Fraquezas */}
                    <View style={styles.defenseCategory}>
                        <Text style={[styles.defenseCategoryTitle, { color: '#EF4444' }]}>
                            ⚠️ FRAQUEZAS (2x+ dano)
                        </Text>
                        <View style={styles.defenseChipsRow}>
                            {activePokemon.weaknesses?.length > 0 ? (
                                activePokemon.weaknesses.map((type, idx) => (
                                    <TypeBadge key={idx} typeName={type} />
                                ))
                            ) : (
                                <Text style={[styles.defenseEmpty, { color: theme.mutedText }]}>
                                    {t('common.empty')}
                                </Text>
                            )}
                        </View>
                    </View>

                    {/* Resistências */}
                    <View style={styles.defenseCategory}>
                        <Text style={[styles.defenseCategoryTitle, { color: '#22C55E' }]}>
                            🛡️ {t('detail.resistances')} (0.5x)
                        </Text>
                        <View style={styles.defenseChipsRow}>
                            {activePokemon.resistances?.length > 0 ? (
                                activePokemon.resistances.map((type, idx) => (
                                    <TypeBadge key={idx} typeName={type} />
                                ))
                            ) : (
                                <Text style={[styles.defenseEmpty, { color: theme.mutedText }]}>
                                    {t('common.empty')}
                                </Text>
                            )}
                        </View>
                    </View>

                    {/* Imunidades */}
                    <View style={styles.defenseCategory}>
                        <Text style={[styles.defenseCategoryTitle, { color: '#8B5CF6' }]}>
                            ✨ {t('detail.immunities')} (0x)
                        </Text>
                        <View style={styles.defenseChipsRow}>
                            {activePokemon.immunities?.length > 0 ? (
                                activePokemon.immunities.map((type, idx) => (
                                    <TypeBadge key={idx} typeName={type} />
                                ))
                            ) : (
                                <Text style={[styles.defenseEmpty, { color: theme.mutedText }]}>
                                    {t('common.empty')}
                                </Text>
                            )}
                        </View>
                    </View>
                </View>

                {/* Linha Evolutiva */}
                {selectedPokemon.evolutions?.length > 0 && (
                    <View
                        style={[
                            styles.detailSection,
                            { backgroundColor: theme.card, borderColor: theme.border },
                        ]}>
                        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                            {t('detail.evolution')}
                        </Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.evolutionScrollContent}>
                            {selectedPokemon.evolutions.map((evo, index) => (
                                <View key={evo.id} style={styles.evolutionStepContainer}>
                                    {/* Seta entre evoluções */}
                                    {index > 0 && (
                                        <Text
                                            style={[
                                                styles.evolutionArrow,
                                                { color: theme.mutedText },
                                            ]}>
                                            ➔
                                        </Text>
                                    )}

                                    {/* Card da evolução */}
                                    <TouchableOpacity
                                        style={[
                                            styles.evolutionCard,
                                            {
                                                backgroundColor: theme.infoBg,
                                                borderColor: theme.border,
                                            },
                                            evo.id === activePokemon.id && {
                                                borderWidth: 2,
                                                borderColor: typeColor,
                                            },
                                        ]}
                                        onPress={() => openPokemonDetail(evo.name)}
                                        activeOpacity={0.85}>
                                        <ExpoImage
                                            source={{ uri: evo.image || DEFAULT_IMAGE }}
                                            style={styles.evolutionImage}
                                            contentFit='contain'
                                            cachePolicy='memory-disk'
                                        />
                                        <Text
                                            style={[
                                                styles.evolutionId,
                                                { color: theme.mutedText },
                                            ]}>
                                            #{formatId(evo.id)}
                                        </Text>
                                        <Text
                                            style={[
                                                styles.evolutionName,
                                                { color: theme.textPrimary },
                                            ]}>
                                            {capitalize(evo.name)}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Lista de Moves */}
                {activePokemon.moves?.length > 0 && (
                    <View
                        style={[
                            styles.detailSection,
                            { backgroundColor: theme.card, borderColor: theme.border },
                        ]}>
                        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                            {t('detail.moves')}
                        </Text>
                        <Text style={[styles.movesDisclaimer, { color: theme.mutedText }]}>
                            *{t('detail.moves')} ({localizedMoves.length})
                        </Text>
                        <View style={styles.movesGrid}>
                            {localizedMoves.map((move, idx) => (
                                <View
                                    key={idx}
                                    style={[
                                        styles.movePill,
                                        {
                                            backgroundColor: theme.badgeBg,
                                            borderColor: theme.border,
                                        },
                                    ]}>
                                    <Text
                                        style={[
                                            styles.movePillText,
                                            { color: theme.textSecondary },
                                        ]}>
                                        {move}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Rodapé com botão de favorito */}
                <View style={styles.detailFooter}>
                    <TouchableOpacity
                        style={[
                            styles.favoriteButtonLarge,
                            favorites.has(activePokemon.id) && styles.favoriteButtonLargeActive,
                            {
                                backgroundColor: favorites.has(activePokemon.id)
                                    ? theme.favoriteActive
                                    : theme.surface,
                                borderColor: theme.border,
                            },
                        ]}
                        onPress={() => handleToggleFavorite(activePokemon.id)}
                        activeOpacity={0.85}>
                        <Text
                            style={[
                                styles.favoriteButtonTextLarge,
                                {
                                    color: favorites.has(activePokemon.id)
                                        ? '#FFFFFF'
                                        : theme.mutedText,
                                },
                            ]}>
                            {favorites.has(activePokemon.id)
                                ? t('detail.favoriteRemove')
                                : t('detail.favoriteAdd')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        );
    }, [
        theme,
        detailLoading,
        detailError,
        selectedPokemon,
        activeFormIndex,
        isShiny,
        audioLoadingId,
        favorites,
        getImageUrl,
        closePokemonDetail,
        openPokemonDetail,
        toggleMegaForm,
        playPokemonCry,
        handleToggleFavorite,
    ]);

    // ==========================================================================
    // RENDER PRINCIPAL
    // ==========================================================================
    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.screen }]}>
            <StatusBar
                barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'}
                backgroundColor={theme.header}
                translucent={IS_WEB}
            />

            {/* Header clássico da Pokédex */}
            {renderHeader()}

            {/* Tabs de navegação */}
            {renderTabs()}

            {/* Toggle de tema (canto superior direito) */}
            <TouchableOpacity
                style={[
                    styles.themeToggle,
                    { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
                onPress={() => setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'))}
                activeOpacity={0.8}>
                <Text style={[styles.themeToggleText, { color: theme.mutedText }]}>
                    {themeMode === 'dark' ? '🌙' : '☀️'}
                </Text>
            </TouchableOpacity>

            {/* Conteúdo principal condicional por tab */}
            <View style={styles.mainContent}>
                {/* TAB: LISTA DE POKÉMON */}
                {activeTab === 'lista' && !selectedPokemon && (
                    <FlatList
                        ref={listRef}
                        data={pokemonList}
                        renderItem={renderPokemonCard}
                        keyExtractor={(item) => String(item.id)}
                        key={`pokemon-list-${responsiveListColumns}`}
                        numColumns={responsiveListColumns}
                        contentContainerStyle={styles.listContent}
                        onEndReached={loadMorePokemons}
                        onEndReachedThreshold={0.3}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={handleRefresh}
                                colors={[theme.buttonPrimary]}
                                tintColor={theme.buttonPrimary}
                                progressBackgroundColor={theme.surface}
                            />
                        }
                        ListHeaderComponent={
                            <>
                                {/* Barra de busca rápida na lista */}
                                <View
                                    style={[
                                        styles.quickSearch,
                                        { backgroundColor: theme.card, borderColor: theme.border },
                                    ]}>
                                    <TextInput
                                        style={[
                                            styles.quickSearchInput,
                                            {
                                                color: theme.text,
                                                backgroundColor: theme.inputBg,
                                                placeholderTextColor: theme.inputPlaceholder,
                                            },
                                        ]}
                                        placeholder={t('list.quickPlaceholder')}
                                        value={searchQuery}
                                        onChangeText={setSearchQuery}
                                        onSubmitEditing={handleSmartSearch}
                                        returnKeyType='search'
                                        autoCapitalize='none'
                                    />
                                    <TouchableOpacity
                                        style={styles.quickSearchButton}
                                        onPress={handleSmartSearch}>
                                        <Text style={styles.quickSearchButtonText}>🔎</Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Contador de Pokémon */}
                                <View style={styles.listHeader}>
                                    <Text
                                        style={[styles.listHeaderText, { color: theme.mutedText }]}>
                                        {t('list.statsLoaded', { count: pokemonList.length })}
                                    </Text>
                                </View>
                            </>
                        }
                        ListFooterComponent={
                            listLoadingMore ? (
                                <View style={styles.loadingMoreContainer}>
                                    <ActivityIndicator size='small' color={theme.buttonPrimary} />
                                    <Text
                                        style={[
                                            styles.loadingMoreText,
                                            { color: theme.mutedText },
                                        ]}>
                                        {t('list.loadingMore')}
                                    </Text>
                                </View>
                            ) : null
                        }
                        initialNumToRender={POKEMON_BATCH_SIZE}
                        maxToRenderPerBatch={POKEMON_BATCH_SIZE}
                        windowSize={7}
                        removeClippedSubviews={true}
                        showsVerticalScrollIndicator={false}
                    />
                )}

                {/* TAB: BUSCA AVANÇADA */}
                {activeTab === 'busca' && !selectedPokemon && (
                    <ScrollView
                        style={styles.searchContent}
                        contentContainerStyle={styles.searchContentContainer}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps='handled'>
                        {renderAdvancedSearch()}

                        {/* Resultados da busca */}
                        {searchLoading ? (
                            <View style={styles.searchLoadingContainer}>
                                <ActivityIndicator size='large' color={theme.buttonPrimary} />
                                <Text
                                    style={[styles.searchLoadingText, { color: theme.mutedText }]}>
                                    {t('search.loading')}
                                </Text>
                            </View>
                        ) : searchResults.length > 0 ? (
                            <View style={styles.searchResultsGrid}>
                                {searchResults.map((pokemon) => (
                                    <TouchableOpacity
                                        key={pokemon.id}
                                        style={[
                                            styles.searchResultCard,
                                            {
                                                width: responsiveGridCardWidth,
                                                backgroundColor: theme.card,
                                                borderTopColor: getTypeColor(
                                                    pokemon.types?.[0]?.type?.name
                                                ),
                                                borderTopWidth: 4,
                                            },
                                        ]}
                                        onPress={() => openPokemonDetail(pokemon.id)}
                                        activeOpacity={0.85}>
                                        <ExpoImage
                                            source={{
                                                uri: pokemon.sprites?.official || DEFAULT_IMAGE,
                                            }}
                                            style={styles.searchResultImage}
                                            contentFit='contain'
                                        />
                                        <Text
                                            style={[
                                                styles.searchResultName,
                                                { color: theme.textPrimary },
                                            ]}>
                                            {pokemon.localizedSpeciesName ||
                                                capitalize(pokemon.name)}
                                        </Text>
                                        <Text
                                            style={[
                                                styles.searchResultId,
                                                { color: theme.mutedText },
                                            ]}>
                                            #{formatId(pokemon.id)}
                                        </Text>
                                        <View style={styles.searchResultTypes}>
                                            {pokemon.types?.slice(0, 2).map((t, idx) => (
                                                <TypeBadge key={idx} typeName={t.type.name} small />
                                            ))}
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ) : searchQuery && !searchError ? (
                            <View style={styles.searchEmptyState}>
                                <Text style={[styles.searchEmptyText, { color: theme.mutedText }]}>
                                    {t('search.emptyDescription')}
                                </Text>
                                <Text
                                    style={[styles.searchEmptyHint, { color: theme.disabledText }]}>
                                    {t('search.heroDescription')}
                                </Text>
                            </View>
                        ) : null}
                    </ScrollView>
                )}

                {/* TAB: FAVORITOS */}
                {activeTab === 'favoritos' && !selectedPokemon && (
                    <ScrollView
                        style={styles.favoritesContent}
                        contentContainerStyle={styles.favoritesContentContainer}
                        showsVerticalScrollIndicator={false}>
                        <View style={styles.favoritesHeader}>
                            <Text style={[styles.favoritesTitle, { color: theme.textPrimary }]}>
                                ❤️ {t('favorites.heroTitle')}
                            </Text>
                            <Text style={[styles.favoritesCount, { color: theme.mutedText }]}>
                                {t('favorites.loaded', { count: favorites.size })}
                            </Text>
                        </View>

                        {favoritesLoading ? (
                            <View style={styles.favoritesLoading}>
                                <ActivityIndicator size='large' color={theme.buttonPrimary} />
                                <Text
                                    style={[
                                        styles.favoritesLoadingText,
                                        { color: theme.mutedText },
                                    ]}>
                                    {t('favorites.loading')}
                                </Text>
                            </View>
                        ) : favoritesList.length > 0 ? (
                            <View style={styles.favoritesGrid}>
                                {favoritesList.map((pokemon) => (
                                    <TouchableOpacity
                                        key={pokemon.id}
                                        style={[
                                            styles.favoriteCard,
                                            {
                                                width: responsiveGridCardWidth,
                                                backgroundColor: theme.card,
                                                borderTopColor: getTypeColor(
                                                    pokemon.types?.[0]?.type?.name
                                                ),
                                                borderTopWidth: 4,
                                            },
                                        ]}
                                        onPress={() => openPokemonDetail(pokemon.id)}
                                        activeOpacity={0.85}>
                                        {/* Botão remover favorito */}
                                        <TouchableOpacity
                                            style={styles.removeFavoriteButton}
                                            onPress={(e) => {
                                                e.stopPropagation();
                                                handleToggleFavorite(pokemon.id);
                                            }}
                                            activeOpacity={0.7}>
                                            <Text style={styles.removeFavoriteText}>✕</Text>
                                        </TouchableOpacity>

                                        <ExpoImage
                                            source={{
                                                uri: pokemon.sprites?.official || DEFAULT_IMAGE,
                                            }}
                                            style={styles.favoriteImage}
                                            contentFit='contain'
                                        />
                                        <Text
                                            style={[
                                                styles.favoriteName,
                                                { color: theme.textPrimary },
                                            ]}>
                                            {pokemon.localizedSpeciesName ||
                                                capitalize(pokemon.name)}
                                        </Text>
                                        <Text
                                            style={[styles.favoriteId, { color: theme.mutedText }]}>
                                            #{formatId(pokemon.id)}
                                        </Text>
                                        <View style={styles.favoriteTypes}>
                                            {pokemon.types?.slice(0, 2).map((t, idx) => (
                                                <TypeBadge key={idx} typeName={t.type.name} small />
                                            ))}
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ) : (
                            <View style={styles.favoritesEmptyState}>
                                <Text
                                    style={[
                                        styles.favoritesEmptyIcon,
                                        { color: theme.favoriteInactive },
                                    ]}>
                                    ♡
                                </Text>
                                <Text
                                    style={[styles.favoritesEmptyText, { color: theme.mutedText }]}>
                                    {t('favorites.emptyDescription')}
                                </Text>
                                <Text
                                    style={[
                                        styles.favoritesEmptyHint,
                                        { color: theme.disabledText },
                                    ]}>
                                    {t('detail.favoriteInfo')}
                                </Text>
                                <TouchableOpacity
                                    style={[
                                        styles.favoritesEmptyButton,
                                        { backgroundColor: theme.buttonPrimary },
                                    ]}
                                    onPress={() => setActiveTab('lista')}
                                    activeOpacity={0.85}>
                                    <Text
                                        style={[
                                            styles.favoritesEmptyButtonText,
                                            { color: theme.buttonPrimaryText },
                                        ]}>
                                        {t('favorites.emptyAction')}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </ScrollView>
                )}

                {/* DETALHE DO POKÉMON (fullscreen, sobrepõe tabs) */}
                {selectedPokemon && renderPokemonDetail()}
            </View>
        </SafeAreaView>
    );
}

// ============================================================================
// 15. STYLESHEET GIGANTESCO (Centenas de estilos profissionais)
// ============================================================================
const styles = StyleSheet.create({
    // ==========================================================================
    // BASE E LAYOUT GLOBAL
    // ==========================================================================
    safeArea: {
        flex: 1,
        backgroundColor: '#0B1020',
    },
    mainContent: {
        flex: 1,
    },

    // ==========================================================================
    // HEADER CLÁSSICO DA POKÉDEX
    // ==========================================================================
    headerContainer: {
        height: IS_WEB ? 100 : 110,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: IS_WEB ? 20 : 16,
        position: 'relative',
        overflow: 'hidden',
        borderBottomWidth: 4,
        borderBottomColor: '#9E0B22',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
            android: { elevation: 8 },
            web: { boxShadow: '0 4px 12px rgba(0,0,0,0.3)' },
        }),
    },
    headerGradient: {
        ...StyleSheet.absoluteFillObject,
    },
    pokedexLensContainer: {
        width: 52,
        height: 52,
        marginRight: IS_WEB ? 20 : 16,
        position: 'relative',
    },
    pokedexLens: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#1FB2FF',
        borderWidth: 4,
        borderColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
        ...Platform.select({
            android: { elevation: 6 },
        }),
    },
    lensReflection: {
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: 'rgba(255,255,255,0.85)',
        position: 'absolute',
        top: 8,
        left: 8,
        transform: [{ rotate: '35deg' }],
    },
    lensInnerGlow: {
        position: 'absolute',
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.15)',
        top: 8,
        left: 8,
    },
    lensScrew: {
        position: 'absolute',
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#2D3748',
        bottom: 4,
        right: 4,
        borderWidth: 1,
        borderColor: '#FFFFFF',
    },
    headerTitle: {
        fontSize: IS_WEB ? 28 : 26,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: 3,
        textShadowColor: 'rgba(0,0,0,0.4)',
        textShadowOffset: { width: 1, height: 2 },
        textShadowRadius: 4,
        flex: 1,
    },
    headerTitleWrap: {
        flex: 1,
        justifyContent: 'center',
        paddingRight: 96,
    },
    headerSubtitle: {
        marginTop: 2,
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1.6,
        textTransform: 'uppercase',
    },
    languageBadge: {
        position: 'absolute',
        right: IS_WEB ? 84 : 78,
        top: 8,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
    },
    languageBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    versionBadge: {
        position: 'absolute',
        right: IS_WEB ? 20 : 16,
        top: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    versionText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },

    // ==========================================================================
    // TABS DE NAVEGAÇÃO
    // ==========================================================================
    tabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: IS_WEB ? 20 : 16,
        paddingVertical: 12,
        backgroundColor: 'rgba(15,23,42,0.95)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.08)',
        zIndex: 10,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderRadius: 14,
        alignItems: 'center',
        marginHorizontal: 4,
        borderWidth: 1,
        borderColor: 'transparent',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: { elevation: 3 },
        }),
    },
    tabButtonActive: {
        borderWidth: 2,
    },
    tabText: {
        fontSize: 13,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    tabIndicator: {
        position: 'absolute',
        bottom: -12,
        width: 24,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#FFFFFF',
    },

    // ==========================================================================
    // TOGGLE DE TEMA
    // ==========================================================================
    themeToggle: {
        position: 'absolute',
        top: IS_WEB ? 115 : 125,
        right: IS_WEB ? 24 : 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        zIndex: 20,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.2,
                shadowRadius: 6,
            },
            android: { elevation: 5 },
        }),
    },
    themeToggleText: {
        fontSize: 18,
        fontWeight: '700',
    },

    // ==========================================================================
    // LISTA PRINCIPAL (GRID)
    // ==========================================================================
    listContent: {
        padding: IS_WEB ? 20 : 16,
        paddingTop: 8,
    },
    quickSearch: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 4,
        marginBottom: 16,
        borderWidth: 1,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 4,
            },
            android: { elevation: 2 },
        }),
    },
    quickSearchInput: {
        flex: 1,
        height: 40,
        fontSize: 15,
        paddingHorizontal: 8,
        borderRadius: 12,
    },
    quickSearchButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
    },
    quickSearchButtonText: {
        fontSize: 18,
    },
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    listHeaderText: {
        fontSize: 13,
        fontWeight: '600',
    },
    gridItem: {
        flex: 1,
        margin: IS_WEB ? 10 : 8,
        borderRadius: 20,
        padding: 16,
        alignItems: 'center',
        minWidth: 0,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.12,
                shadowRadius: 10,
            },
            android: { elevation: 5 },
        }),
    },
    favoriteBadge: {
        position: 'absolute',
        zIndex: 2,
    },
    favoriteIcon: {
        fontSize: 20,
        fontWeight: '900',
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    gridImageContainer: {
        width: 90,
        height: 90,
        borderRadius: 45,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    gridImage: {
        width: 80,
        height: 80,
    },
    gridId: {
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 2,
    },
    gridName: {
        fontSize: 15,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: 8,
    },
    gridTypesRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 6,
    },
    skeletonText: {
        height: 16,
        borderRadius: 8,
    },
    skeletonBadge: {
        width: 40,
        height: 20,
        borderRadius: 10,
    },
    loadingMoreContainer: {
        paddingVertical: 24,
        alignItems: 'center',
        gap: 10,
    },
    loadingMoreText: {
        fontSize: 13,
        fontWeight: '600',
    },

    // ==========================================================================
    // BUSCA AVANÇADA
    // ==========================================================================
    searchContent: {
        flex: 1,
    },
    searchContentContainer: {
        padding: IS_WEB ? 20 : 16,
        paddingTop: 8,
    },
    searchSection: {
        borderRadius: 24,
        padding: IS_WEB ? 20 : 16,
        marginBottom: 20,
        borderWidth: 1,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
            },
            android: { elevation: 4 },
        }),
    },
    searchModeRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 16,
    },
    searchModeButton: {
        flex: 1,
        minWidth: 70,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 14,
        alignItems: 'center',
        borderWidth: 1.5,
    },
    searchModeButtonActive: {
        borderWidth: 2,
    },
    searchModeButtonText: {
        fontSize: 12,
        fontWeight: '700',
    },
    searchInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 16,
    },
    searchInput: {
        flex: 1,
        height: 48,
        borderRadius: 16,
        paddingHorizontal: 18,
        fontSize: 16,
        borderWidth: 1.5,
    },
    searchButton: {
        minWidth: 108,
        height: 48,
        borderRadius: 16,
        paddingHorizontal: 18,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: 'transparent',
    },
    searchButtonText: {
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 1,
    },
    searchHelpText: {
        marginTop: 8,
        marginBottom: 12,
        fontSize: 12,
        lineHeight: 16,
        fontWeight: '500',
    },
    variantSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
        flexWrap: 'wrap',
    },
    variantLabel: {
        fontSize: 13,
        fontWeight: '600',
        marginRight: 4,
    },
    variantButton: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
    },
    variantButtonActive: {
        borderWidth: 2,
    },
    variantButtonText: {
        fontSize: 12,
        fontWeight: '700',
    },
    errorMessage: {
        padding: 14,
        borderRadius: 14,
        borderWidth: 1,
        marginBottom: 16,
        alignItems: 'center',
    },
    errorText: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
    searchResultsHeader: {
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    searchResultsCount: {
        fontSize: 14,
        fontWeight: '700',
    },
    searchLoadingContainer: {
        paddingVertical: 40,
        alignItems: 'center',
        gap: 12,
    },
    searchLoadingText: {
        fontSize: 14,
        fontWeight: '600',
    },
    searchResultsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -6,
    },
    searchResultCard: {
        flex: 1,
        minWidth: '48%',
        margin: 6,
        borderRadius: 18,
        padding: 14,
        alignItems: 'center',
    },
    searchResultImage: {
        width: 70,
        height: 70,
        marginBottom: 10,
    },
    searchResultName: {
        fontSize: 14,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: 2,
    },
    searchResultId: {
        fontSize: 11,
        fontWeight: '600',
        marginBottom: 8,
    },
    searchResultTypes: {
        flexDirection: 'row',
        gap: 4,
    },
    searchEmptyState: {
        paddingVertical: 40,
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    searchEmptyText: {
        fontSize: 15,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 8,
        lineHeight: 22,
    },
    searchEmptyHint: {
        fontSize: 13,
        textAlign: 'center',
        fontStyle: 'italic',
    },

    // ==========================================================================
    // FAVORITOS
    // ==========================================================================
    favoritesContent: {
        flex: 1,
    },
    favoritesContentContainer: {
        padding: IS_WEB ? 20 : 16,
        paddingTop: 8,
    },
    favoritesHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingHorizontal: 4,
    },
    favoritesTitle: {
        fontSize: 20,
        fontWeight: '900',
    },
    favoritesCount: {
        fontSize: 14,
        fontWeight: '600',
    },
    favoritesLoading: {
        paddingVertical: 40,
        alignItems: 'center',
        gap: 12,
    },
    favoritesLoadingText: {
        fontSize: 14,
        fontWeight: '600',
    },
    favoritesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -6,
    },
    favoriteCard: {
        flex: 1,
        minWidth: '48%',
        margin: 6,
        borderRadius: 18,
        padding: 14,
        alignItems: 'center',
        position: 'relative',
    },
    removeFavoriteButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(239,68,68,0.9)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 3,
    },
    removeFavoriteText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '900',
        lineHeight: 20,
    },
    favoriteImage: {
        width: 70,
        height: 70,
        marginBottom: 10,
    },
    favoriteName: {
        fontSize: 14,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: 2,
    },
    favoriteId: {
        fontSize: 11,
        fontWeight: '600',
        marginBottom: 8,
    },
    favoriteTypes: {
        flexDirection: 'row',
        gap: 4,
    },
    favoritesEmptyState: {
        paddingVertical: 60,
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    favoritesEmptyIcon: {
        fontSize: 48,
        fontWeight: '900',
        marginBottom: 16,
    },
    favoritesEmptyText: {
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 8,
        lineHeight: 24,
    },
    favoritesEmptyHint: {
        fontSize: 14,
        textAlign: 'center',
        color: '#64748B',
        marginBottom: 24,
        lineHeight: 20,
    },
    favoritesEmptyButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 16,
    },
    favoritesEmptyButtonText: {
        fontSize: 14,
        fontWeight: '800',
    },

    // ==========================================================================
    // DETALHE DO POKÉMON (FULLSCREEN)
    // ==========================================================================
    detailContainer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#0B1020',
        zIndex: 100,
    },
    detailContent: {
        paddingBottom: 30,
    },
    detailHeader: {
        paddingHorizontal: IS_WEB ? 24 : 20,
        paddingTop: IS_WEB ? 20 : 16,
        paddingBottom: 16,
    },
    backButton: {
        alignSelf: 'flex-start',
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 20,
        marginBottom: 16,
        borderWidth: 1,
    },
    backButtonText: {
        fontSize: 14,
        fontWeight: '700',
    },
    detailTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 8,
    },
    detailPokemonName: {
        fontSize: IS_WEB ? 28 : 26,
        fontWeight: '900',
        flex: 1,
        marginRight: 12,
    },
    detailPokemonId: {
        fontSize: 20,
        fontWeight: '700',
    },
    detailTypesRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 4,
    },
    detailImageBlock: {
        alignItems: 'center',
        paddingVertical: IS_WEB ? 20 : 16,
        paddingHorizontal: IS_WEB ? 24 : 20,
    },
    detailImageContainer: {
        width: IS_WEB ? 280 : SCREEN_WIDTH * 0.7,
        height: IS_WEB ? 280 : SCREEN_WIDTH * 0.7,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        marginBottom: 20,
    },
    detailPokemonImage: {
        width: '95%',
        height: '95%',
    },
    shinySparkle: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(252,211,77,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#FCD34D',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 12,
            },
            android: { elevation: 8 },
        }),
    },
    shinySparkleText: {
        fontSize: 20,
        fontWeight: '900',
    },
    detailActionButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: IS_WEB ? 14 : 12,
        marginBottom: 16,
        flexWrap: 'wrap',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 20,
        borderWidth: 2,
        minWidth: 110,
        justifyContent: 'center',
    },
    actionButtonActive: {
        borderWidth: 2.5,
    },
    actionButtonText: {
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    detailInfoBadge: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 16,
        marginTop: 4,
    },
    detailInfoText: {
        fontSize: 13,
        fontWeight: '700',
    },
    detailSection: {
        marginHorizontal: IS_WEB ? 24 : 20,
        marginBottom: 16,
        borderRadius: 24,
        padding: IS_WEB ? 24 : 20,
        borderWidth: 1,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
            },
            android: { elevation: 3 },
        }),
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: '900',
        marginBottom: 16,
        paddingBottom: 10,
        borderBottomWidth: 2,
        borderBottomColor: 'rgba(148,163,184,0.28)',
    },
    descriptionText: {
        fontSize: 15,
        lineHeight: 23,
        fontStyle: 'italic',
        textAlign: 'center',
        marginBottom: 20,
    },
    detailInfoGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(148,163,184,0.08)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },
    detailInfoItem: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
        borderRightWidth: 1,
        borderRightColor: 'rgba(148,163,184,0.22)',
    },
    detailInfoLabel: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 4,
    },
    detailInfoValue: {
        fontSize: 16,
        fontWeight: '800',
    },
    abilitiesRow: {
        marginTop: 8,
    },
    abilitiesLabel: {
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    abilitiesChips: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    abilityChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 14,
    },
    abilityChipText: {
        fontSize: 12,
        fontWeight: '700',
    },
    radarWrap: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 8,
    },
    statsList: {
        marginTop: 16,
        gap: 10,
    },
    statRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    statLabel: {
        width: 45,
        fontSize: 12,
        fontWeight: '700',
    },
    statValue: {
        width: 38,
        fontSize: 13,
        fontWeight: '800',
        textAlign: 'right',
    },
    statBarBg: {
        flex: 1,
        height: 10,
        borderRadius: 5,
        overflow: 'hidden',
    },
    statBarFill: {
        height: '100%',
        borderRadius: 5,
    },
    defenseCategory: {
        marginBottom: 16,
    },
    defenseCategoryTitle: {
        fontSize: 13,
        fontWeight: '800',
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    defenseChipsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    defenseEmpty: {
        fontSize: 13,
        fontStyle: 'italic',
    },
    evolutionScrollContent: {
        alignItems: 'center',
        paddingVertical: 8,
    },
    evolutionStepContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    evolutionArrow: {
        fontSize: 22,
        fontWeight: '900',
        marginHorizontal: 12,
    },
    evolutionCard: {
        width: 90,
        borderRadius: 16,
        padding: 12,
        alignItems: 'center',
        borderWidth: 1,
    },
    evolutionImage: {
        width: 60,
        height: 60,
        marginBottom: 8,
    },
    evolutionId: {
        fontSize: 10,
        fontWeight: '700',
        marginBottom: 2,
    },
    evolutionName: {
        fontSize: 11,
        fontWeight: '800',
        textAlign: 'center',
    },
    movesDisclaimer: {
        fontSize: 11,
        fontStyle: 'italic',
        marginBottom: 12,
    },
    movesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    movePill: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 16,
        borderWidth: 1,
    },
    movePillText: {
        fontSize: 12,
        fontWeight: '700',
    },
    detailFooter: {
        paddingHorizontal: IS_WEB ? 24 : 20,
        paddingTop: 8,
        paddingBottom: 20,
    },
    favoriteButtonLarge: {
        width: '100%',
        paddingVertical: 16,
        borderRadius: 20,
        alignItems: 'center',
        borderWidth: 2,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
            },
            android: { elevation: 6 },
        }),
    },
    favoriteButtonLargeActive: {
        borderWidth: 2.5,
    },
    favoriteButtonTextLarge: {
        fontSize: 14,
        fontWeight: '800',
    },
    loadingText: {
        fontSize: 15,
        fontWeight: '600',
        marginTop: 20,
    },
    retryButton: {
        marginTop: 24,
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 18,
    },
    retryButtonText: {
        fontSize: 15,
        fontWeight: '700',
    },

    // ==========================================================================
    // COMPONENTES REUTILIZÁVEIS
    // ==========================================================================
    typeBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    typeBadgeSmall: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 14,
    },
    typeBadgePressable: {
        opacity: 0.95,
    },
    typeBadgeText: {
        fontSize: 11,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    typeBadgeTextSmall: {
        fontSize: 9,
        fontWeight: '700',
    },
});
