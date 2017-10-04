import React, { Component } from 'react';
import {
    View,
    Button,
    TextInput,
    Text,
    List,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Image,
    Modal,
    Dimensions,
    StyleSheet,
} from 'react-native';

import axios from 'axios';

const key_google = "AIzaSyB02wRkTb1b8kAtdjA5_tuMwegrt6QCJHY"; 
const key_google_maps = "AIzaSyBIPZTXAXQG64y51Smhg7PB29P5zfu2r9s";

const styles = StyleSheet.create({
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.5)',
      height: 45,
    }
})

class SearchScreen extends Component {

    state = {
        erro: '',
        locais: { 
            results: null 
        },
        aguarde: false,
        latitude: null,
        longitude: null,
        exibirModal: false,
        detalhes: '',
        foto: '',
        mapa: '',
    }  

    // Capturar geocalização
    componentDidMount() {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            this.setState({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              error: null,
            });
          },
          (error) => this.setState({ error: error.message }),
          { enableHighAccuracy: false },
        );
      }

    onBuscarPress = () => {
        // alert(this.state.busca);
        this.setState({ aguarde: true });

        if (this.state.erro){
            return (
                <Text style={{ color: '#f00' }} >{this.state.erro}</Text>
            )
        }

        let locais = null;
        let erro = '';
        let URL = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${this.state.busca}&location=${this.state.latitude},${this.state.longitude}&key=${key_google}`;
    
        axios.get(URL).then( (response) => {
            if(response.status === 200){
                locais = response.data;
            } else {
                erro = "Tente novamente mais tarde.";
            }

        }).catch( (exception) => {
            console.warn(exception);
            erro = 'Não foi possível completar a operação, verifique sua conexão.';

        }).finally( () => {
            this.setState({
                aguarde: false, locais: locais, erro: erro 
            });
            console.log(this.state.locais);
        })
    }

    onChangeBusca = (text) => {
        this.setState( { busca: text } )
    }

    renderModal = () => {
            let URL_PHOTO_LOCAL = this.getPhotoLocal();
            let URL_PHOTO_LOCAL_MAP = this.getPhotoLocalMap();
            

            return (
                <View>
                    <Modal 
                        visible={this.state.exibirModal}
                        transparent={true}
                        onRequestClose={() => this.setState( {exibirModal: false} ) } >

                        <View>
                            <Image
                                source={{ uri: URL_PHOTO_LOCAL }}
                                style={{ width: Dimensions.get('window').width, height: 215 }}
                            />
                            <View style={styles.overlay}>
                                <Text style={{ color: "#FFF", fontSize: 16, padding: 10, fontWeight: "bold" }}  onPress={ () => this.setState({ exibirModal: false }) }>Sair</Text>
                            </View>
                        </View>
    
                        <View style={ { flex: 1, backgroundColor: '#FFF', padding: 15 } }>
                            <Text style={{ color: "#000", fontSize: 24 }}>{this.state.detalhes.name}  [{this.state.detalhes.rating}]</Text>                            
                            <Text style={{ color: "#c3c3c3", fontSize: 14 }}>{this.state.detalhes.formatted_address}</Text>
                            <Text style={{ color: "#000", fontSize: 14 }}>{this.state.detalhes.formatted_phone_number}</Text>                            
                            <Image
                                source={{ uri: URL_PHOTO_LOCAL_MAP }}
                                style={{ width: (Dimensions.get('window').width - 30), height: 150, marginTop: 20 }}
                            />
                        </View>
                    </Modal>
                </View>
            )
    }

    getPhotoLocal = () => {
        let URL_PHOTO = null;
        if(this.state.detalhes.photos){
            if(this.state.detalhes.photos[0].photo_reference !== undefined){
                URL_PHOTO = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=500&photoreference=${this.state.detalhes.photos[0].photo_reference}&key=${key_google}`;
            }
        }

        return URL_PHOTO;
    }

    getPhotoLocalMap = () => {
        let latitude = null;
        let longitude = null;
        let URL_MAP = null;
        if(this.state.detalhes.geometry){
            if(this.state.detalhes.geometry.location){
                latitude = this.state.detalhes.geometry.location.lat;
                longitude = this.state.detalhes.geometry.location.lng;

                URL_MAP = `https://maps.googleapis.com/maps/api/staticmap?markers=${latitude},${longitude}&zoom=16&size=600x300&key=${key_google_maps}`;
            }
        }

        return URL_MAP;
    }

    onItemPress = (id) => {
        
        // alert(this.state.busca);
        this.setState({ aguarde: true });
    
        let erro = '';
        let detalhes = '';
        let exibir = false;
        let URL = `https://maps.googleapis.com/maps/api/place/details/json?placeid=${id}&key=${key_google}`;
    
        axios.get(URL).then( (response) => {
            console.log(response);
            if(response.status === 200){
                detalhes = response.data.result;
                exibir = true;
            } else {
                erro = "Tente novamente mais tarde.";
            }

        }).catch( (exception) => {
            console.warn(exception);
            erro = 'Não foi possível completar a operação, verifique sua conexão.';

        }).finally( () => {
            this.setState({
                aguarde: false, erro: erro, exibirModal: exibir, detalhes: detalhes
            });
        })

        
    }

    renderContent = () => {
        // Se o estado de aguardando for true irá exibir o GIF de carregamento
        if (this.state.aguarde) {
            return (
                <ActivityIndicator size="large" color="#f00" />
            )
        }

        // Se o estado "erro" for true, irá exibir a mensagem de erro
        if (this.state.erro) {
            return (
                <Text style={{ color: '#f00' }} >{this.state.erro}</Text>
            )
        }

        if (this.state.locais.results){
            return (
                <FlatList data={this.state.locais.results} renderItem={this.renderItem} keyExtractor={(item) => item.id} />                
            );
        }
    }


    renderItem = (record) => {
        
        const { item, index } = record; 
        /*  Equivalente:
                const item = record.item;
                const index = record.index;
        */
        let URL_PHOTO = null;
        if(item.photos){
            if(item.photos[0].photo_reference !== undefined){
                URL_PHOTO = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${item.photos[0].photo_reference}&key=${key_google}`;
            }
        }
        return (
            <TouchableOpacity onPress={ () => this.onItemPress(item.place_id) } >
                <View style={{
                    backgroundColor: '#fff',
                    marginHorizontal: 16,
                    marginVertical: 8,
                    padding: 16,
                    borderRadius: 5,
                    elevation: 2,
                    shadowOffset: {
                        width: 2,
                        height: 2,
                    },
                    shadowColor: '#333',
                    flexDirection: 'row'
                }}>
                    <View>
                        <Image
                            source={{ uri: URL_PHOTO }}
                            style={{ width: 100, height: 100 }}
                        />
                    </View>
                    <View style={{ flexDirection: 'column', justifyContent: 'flex-start', paddingHorizontal: 10, width: 180, height: 100 }}>
                        <Text style={{ color: "#000", fontSize: 16 }}>{item.name}</Text>
                        <Text style={{ color: "#c3c3c3", fontSize: 14}}>{item.formatted_address}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }

    renderForm = () => {
        return (
            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                margin: 20,
                alignItems: 'center'
            }}>
                <TextInput
                placeholder="O que procura?"
                value={this.state.busca}
                onChangeText={this.onChangeBusca}
                style={{ width: 200, backgroundColor: "#FFF", paddingVertical: 15, borderRadius: 3 }}
                />
                <Button title="Buscar" onPress={this.onBuscarPress} />

            </View>
        )
    }

    render() {

        return (
            <View>
               {this.renderForm()}
               {this.renderModal()}
               {this.renderContent()}
            </View>
        )
    }
}

export default SearchScreen;