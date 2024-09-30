import React from 'react'

import { api } from 'src/services/api'

import { useQuery } from 'react-query'

import { Map } from './components/Map'
import { MapContainer } from 'react-leaflet'

/**
 * TODO
 * - refactor monstro
 * - numero de palpites pra perder
 * - localizacao
 */

const speacher = new SpeechSynthesisUtterance()

interface ICountry {
  name: {
    common: string
    official: string
  }
  capital: string[]
  region: string
  subregion: string
  latlng: number[]
  area: number
  maps: {
    googleMaps: string
    openStreetMaps: string
  }
  population: number
  continents: string[]
  flags: {
    png: string
    svg: string
  }
}

export const App = () => {
  const [voices, setVoices] = React.useState<SpeechSynthesisVoice[]>()
  const [currentVoiceId, setCurrentVoiceId] = React.useState<number>(1)
  const [region, setRegion] = React.useState('all')

  const [countries, setCountries] = React.useState<ICountry[]>([])
  const [, setCountriesPicked] = React.useState<ICountry[]>([])

  const [currentFlag, setCurrentFlag] = React.useState<ICountry | null>()

  const speak = React.useCallback(
    (text: string, voiceId?: number, rate?: number) => {
      if (!speacher || !voices) return

      speechSynthesis.cancel()
      speacher.text = text
      speacher.rate = rate ?? 1
      speacher.voice = voices[voiceId ?? currentVoiceId]
      speechSynthesis.speak(speacher)
    },
    [currentVoiceId, voices]
  )

  React.useEffect(() => {
    const getVoiceList = () => setVoices(speechSynthesis.getVoices())
    speechSynthesis.addEventListener('voiceschanged', getVoiceList)

    return () => {
      speechSynthesis.removeEventListener('voiceschanged', getVoiceList)
    }
  }, [])

  const pickNextGuess = async () => {
    const flagRandomId = (Math.random() * countries.length) | 0
    const flag: ICountry = countries[flagRandomId]
    setCurrentFlag(flag)
  }

  React.useEffect(() => {
    if (countries.length >= 1) {
      pickNextGuess()
    } else {
      speak('Parabéns! você venceu!', 0, 5)
    }
  }, [countries])

  React.useEffect(() => {
    if (currentFlag && countries.length > 0) speak(currentFlag.name.common)
  }, [currentFlag, speak, currentVoiceId, countries])

  const { isLoading, data } = useQuery(
    ['fetchFlags', region],
    () => (region === 'all' ? api.get('all') : api.get(`region/${region}`)),
    {
      onSuccess: (data) => {
        setCountries(data.data)
      },
      refetchOnWindowFocus: false,
    }
  )

  const handleCheckGuess = (country: ICountry) => {
    if (country.name.common === currentFlag?.name.common) {
      setCountriesPicked((current) => [...current, country])
      setCountries((current) =>
        current.filter((c) => c.name.common !== country.name.common)
      )
      if (countries.length > 1) {
        pickNextGuess()
      }
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex gap-5 flex-wrap items-center border-b-[1px] pb-5 border-neutral-700 p-5 bg-neutral-800">
        <span className="text-4xl text-white mr-32">
          🌍Orbis <span className="text-xs text-neutral-400">beta</span>
        </span>

        <div className="flex gap-5">
          <select
            className="bg-neutral-800 p-3 rounded-xl min-w-0"
            onChange={(e) => setRegion(e.target.value)}
          >
            <option key={1} value={'all'}>
              Todos
            </option>
            <option key={2} value={'america'}>
              America
            </option>
            <option key={3} value={'europe'}>
              Europa
            </option>
            <option key={4} value={'asia'}>
              Ásia
            </option>
            <option key={5} value={'africa'}>
              Africa
            </option>
            <option key={6} value={'oceania'}>
              Oceania
            </option>
          </select>
          <select
            className="bg-neutral-800 p-3 rounded-xl min-w-0"
            onChange={(e) => setCurrentVoiceId(Number(e.target.value))}
          >
            {voices?.map((voice, id) => (
              <option key={id} value={id}>
                {voice.voiceURI}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col p-5 items-start gap-3">
        <div className="flex items-center justify-center">
          {!isLoading && currentFlag && (
            <span className="text-white text-xl">
              <span className="text-sm mr-2">{countries.length} 🏳️ </span>
              <span> — {currentFlag.name.common}</span>
            </span>
          )}
        </div>

        <div className="flex gap-5 justify-center md:justify-start flex-wrap">
          {!isLoading &&
            data?.data.map((country: ICountry) => (
              <img
                key={country.name.official}
                src={country.flags.svg}
                onClick={handleCheckGuess.bind(this, country)}
                className={`h-[60px] hover:z-10 select-none hover:scale-150 transition-transform rounded-md hover:shadow-2xl will-change-transform hover:shadow-black ${!countries.includes(country) && 'grayscale pointer-events-none opacity-10'}`}
              />
            ))}
        </div>
      </div>

      {currentFlag && (
        <MapContainer
          className="w-full h-[400px]"
          center={[currentFlag.latlng[0], currentFlag.latlng[1]]}
          zoom={3.5}
        >
          <Map
            lat={currentFlag.latlng[0]}
            long={currentFlag.latlng[1]}
            name={currentFlag.name.common}
          />
        </MapContainer>
      )}
    </div>
  )
}
