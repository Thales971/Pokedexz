# 🟥 POKÉDEX PRO - Retro Classic Pokédex em React Native + Expo

![Pokédex Banner](https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png)

**Uma Pokédex clássica, retrô e completa feita com Expo!**  
Visual retro clássico, temas light + dark aprimorados, tradução automática com suporte a múltiplos
idiomas, radar chart, favoritos, grito dos Pokémon e muito mais.

---

## ✨ Funcionalidades

- **Visual retrô clássico** – Header vermelho, lente azul e acabamento inspirado no hardware
  original
- **Lista em grid** com infinite scroll + Pull-to-Refresh
- **Busca avançada** por:
    - Nome ou ID
    - Tipo (suporte completo em português: fogo, água, grama, elétrico, dragão, etc.)
    - Geração (1 a 9, kanto, johto, hoenn, etc.)
- **Tela de detalhes completa**:
    - Imagem oficial em alta qualidade (com `expo-image`)
    - Toggle **Shiny**
    - Toggle **Mega / Primal**
    - **Grito do Pokémon** com áudio (`expo-av`)
    - **Radar Chart** lindo e detalhado (com anéis, labels e pontos)
    - Barras de status + efetividade completa (Fraquezas, Resistências, Imunidades)
    - Linha evolutiva clicável
    - Moves (primeiros 30 ataques) em pills
    - Descrição em português/inglês, habitat, taxa de captura, altura, peso e habilidades
- **Favoritos** com coração ❤️ (salvo com AsyncStorage + vibração via Haptics)
- **Temas Light / Dark aprimorados** com alternância no header
- **Tradução automática** com detecção de idioma do dispositivo e botão para alternar manualmente
- **Tabs intuitivas**: Lista | Busca Avançada | Favoritos
- **Totalmente responsivo** (funciona perfeitamente no Expo Go e no navegador)
- **Performance otimizada** e código limpo com muitos comentários

---

## 📸 Screenshots

### Em breve

Adicione suas capturas aqui após testar o app.

| Lista Principal                                                        | Tela de Detalhe                                                            | Busca Avançada                                                         |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| ![Lista](https://via.placeholder.com/300x600/FF0000/FFFFFF?text=Lista) | ![Detalhe](https://via.placeholder.com/300x600/EE8130/FFFFFF?text=Detalhe) | ![Busca](https://via.placeholder.com/300x600/7AC74C/FFFFFF?text=Busca) |

---

## 🚀 Como Rodar o Projeto

### Pré-requisitos

- Node.js (recomendado v18+)
- Expo CLI (`npm install -g expo-cli` ou use `npx expo`)

### Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/SEU_USUARIO/pokedex-pro.git
cd pokedex-pro

# 2. Instale as dependências
npx expo install expo-av react-native-svg @react-native-async-storage/async-storage expo-haptics expo-image expo-localization expo-linear-gradient

# 3. Inicie o projeto
npx expo start
```
