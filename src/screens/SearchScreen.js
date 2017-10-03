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
    Image
} from 'react-native';

import axios from 'axios';

const key_google = "AIzaSyB02wRkTb1b8kAtdjA5_tuMwegrt6QCJHY"; 

class SearchScreen extends Component {

    state = {
        erro: '',
        locais: { 
            results: null 
        },
        aguarde: false,
        latitude: null,
        longitude: null,
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
          { enableHighAccuracy: false, timeout: 20000, maximumAge: 1000 },
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

    onItemPress = () => {
        alert("Hello");
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
            <TouchableOpacity onPress={ () => this.onItemPress(item) } >
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
                    <View style={{ flexDirection: 'column', justifyContent: 'flex-start' }}>
                        <Text style={{ color: "#000", fontSize: 16 }}>{item.name}</Text>
                        <Text style={{ color: "#c3c3c3", fontSize: 14, width: 30, height: 30 }}>{item.formatted_address}</Text>
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
               {this.renderContent()}
            </View>
        )
    }
}

export default SearchScreen;