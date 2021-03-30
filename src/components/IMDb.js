/* eslint-disable react-native/no-inline-styles */
import React, {useState, useRef, useEffect} from 'react';
import {Animated, View, Text, Pressable, ScrollView} from 'react-native';
import Adjust from './AdjustText';
import FastImage from 'react-native-fast-image';
import NetInfo from '@react-native-community/netinfo';
import Axios from 'axios';
import {
  faArrowLeft,
  faPlay,
  faStar,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';
import {faImdb} from '@fortawesome/free-brands-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {ACCENT_COLOR, MAIN_LIGHT, statusHeight} from '../assets/variables';
import {EN, RO} from '../assets/lang';
// Redux
import {useSelector} from 'react-redux';

export default function IMDb({route, navigation}) {
  const [loading, setLoading] = useState(true);
  const [IMDbData, setIMDbData] = useState(null);
  const [isNetReachable, setIsNetReachable] = useState(true);
  const [downloadAnimation] = useState(new Animated.Value(0));
  const {autoplay, enLang, fontSizes, lightTheme} = useSelector(
    (state) => state.appConfig,
  );
  const netRef = useRef(false);
  // Connection listener effect
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isInternetReachable) {
        if (netRef.current) {
          setIsNetReachable(true);
        } else {
          netRef.current = true;
        }
      } else {
        setIsNetReachable(false);
      }
    });
    return () => {
      unsubscribe();
    };
  }, [isNetReachable]);

  // IMDb axios effect
  useEffect(() => {
    const source = Axios.CancelToken.source();
    fetchIMDbInfo(route.params.id, source);
    Animated.loop(
      Animated.sequence([
        Animated.timing(downloadAnimation, {
          toValue: 0.65,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(downloadAnimation, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
      {
        iterations: 20,
      },
    ).start();
    return () => {
      source.cancel();
      Animated.loop(
        Animated.sequence([
          Animated.timing(downloadAnimation, {
            toValue: 0.65,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(downloadAnimation, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
        ]),
        {
          iterations: 20,
        },
      ).stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Functions
  const handleBack = () => {
    navigation.goBack();
  };
  const checkYearExists = (title) => {
    let regex = new RegExp(/((\d\d\d\d))/);
    return regex.test(title);
  };
  const fetchIMDbInfo = async (id, cancel) => {
    if (isNetReachable) {
      await Axios.get(`https://inkthatquote.com/${id}`, {
        cancelToken: cancel.token,
      })
        .then((res) => {
          setIMDbData(Array(res.data));
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  };

  return (
    <>
      <View
        style={{
          height: statusHeight * 3.5,
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: ACCENT_COLOR,
        }}>
        <Pressable
          style={{
            position: 'absolute',
            top: statusHeight * 1.3,
            left: statusHeight / 1.5,
          }}
          android_ripple={{
            color: 'white',
            borderless: true,
            radius: statusHeight / 1.3,
          }}
          onPress={handleBack}>
          <FontAwesomeIcon
            color={'white'}
            size={Adjust(22)}
            icon={faArrowLeft}
          />
        </Pressable>
        <Text
          style={{
            fontSize: Adjust(16),
            marginTop: statusHeight / 1.3,
            marginBottom: statusHeight / 2,
            fontWeight: 'bold',
            color: 'white',
          }}>
          IMDb Info
        </Text>
      </View>
      {loading ? (
        <View
          style={{
            width: '100%',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            paddingBottom: statusHeight * 5,
            backgroundColor: lightTheme ? MAIN_LIGHT : 'black',
          }}>
          <Animated.View
            style={{
              backgroundColor: 'black',
              borderRadius: 15,
              transform: [
                {
                  scale: downloadAnimation,
                },
              ],
            }}>
            <FontAwesomeIcon
              size={Adjust(100)}
              color={'#deb522'}
              icon={faImdb}
            />
          </Animated.View>
        </View>
      ) : IMDbData ? (
        IMDbData.map((item, index) => {
          return (
            <ScrollView
              key={index}
              style={{
                backgroundColor: lightTheme ? MAIN_LIGHT : 'black',
              }}
              contentContainerStyle={{alignItems: 'center'}}
              showsVerticalScrollIndicator={false}>
              <View
                style={{
                  width: 350,
                  height: 450,
                  marginTop: statusHeight * 1.5,
                  backgroundColor: 'transparent',
                }}>
                <FastImage
                  style={{width: '100%', height: '100%'}}
                  resizeMode={FastImage.resizeMode.contain}
                  source={{
                    uri: item.posterhq,
                  }}
                />
              </View>
              <Text
                style={{
                  fontSize: Adjust(18),
                  textAlign: 'center',
                  fontWeight: 'bold',
                  color: lightTheme ? 'black' : 'white',
                  marginTop: statusHeight,
                  marginBottom: statusHeight / 3,
                  paddingHorizontal: statusHeight,
                }}>
                {`${item.title} ${
                  checkYearExists(item.title) ? '' : `(${item.year})`
                }`}{' '}
                <Text
                  style={[
                    {
                      fontSize: Adjust(18),
                      color: lightTheme ? 'black' : 'white',
                      fontWeight: 'bold',
                    },
                  ]}>
                  {item.rating}
                </Text>{' '}
                {item.rating === '' ? null : (
                  <FontAwesomeIcon
                    icon={faStar}
                    size={Adjust(15)}
                    color={lightTheme ? 'goldenrod' : 'gold'}
                  />
                )}
              </Text>
              <Text
                style={{
                  fontSize: Adjust(12),
                  paddingHorizontal: statusHeight * 2,
                  textAlign: 'center',
                  color: lightTheme ? 'black' : 'white',
                }}>
                {`${item.duration} | ${item.genre}`}
              </Text>
              <Text
                style={{
                  fontSize: Adjust(12),
                  marginTop: statusHeight / 3,
                  marginBottom: statusHeight,
                  paddingHorizontal: statusHeight / 2,
                  textAlign: 'center',
                  color: lightTheme ? 'black' : 'white',
                }}>
                {item.plot}
              </Text>
              <View
                style={{
                  width: '60%',
                  height: statusHeight * 1.5,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 34,
                  overflow: 'hidden',
                  marginVertical: statusHeight / 2,
                  backgroundColor: ACCENT_COLOR,
                }}>
                <Pressable
                  style={{
                    width: '100%',
                    height: '100%',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 34,
                  }}
                  android_ripple={{
                    color: 'black',
                    borderless: false,
                  }}
                  onPress={() =>
                    navigation.navigate('Trailer', {
                      trailerLink: item.trailer,
                      autoplay,
                    })
                  }>
                  <FontAwesomeIcon
                    size={Adjust(fontSizes !== null ? fontSizes[6] : 14)}
                    style={{marginRight: 10}}
                    color={'white'}
                    icon={faPlay}
                  />
                  <Text
                    style={[
                      {
                        fontSize: Adjust(
                          fontSizes !== null ? fontSizes[6] : 14,
                        ),
                        color: 'white',
                        fontWeight: 'bold',
                      },
                    ]}>
                    Watch trailer
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          );
        })
      ) : (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: lightTheme ? MAIN_LIGHT : 'black',
            paddingBottom: statusHeight * 7,
          }}>
          <FontAwesomeIcon
            size={Adjust(100)}
            style={{marginBottom: statusHeight / 5}}
            color={lightTheme ? 'black' : 'white'}
            icon={faExclamationTriangle}
          />
          <Text
            style={{
              fontSize: Adjust(20),
              fontWeight: 'bold',
              textAlign: 'center',
              color: lightTheme ? 'black' : 'white',
              paddingHorizontal: statusHeight,
              marginBottom: statusHeight / 5,
            }}>
            {enLang ? EN.imdbNetErrH : RO.imdbNetErrH}
          </Text>
          <Text
            style={{
              fontSize: Adjust(14),
              textAlign: 'center',
              color: lightTheme ? 'black' : 'white',
              paddingHorizontal: statusHeight,
            }}>
            {enLang ? EN.imdbNetErrP : RO.imdbNetErrP}
          </Text>
        </View>
      )}
    </>
  );
}