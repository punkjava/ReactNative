import React, { Component } from 'react';
import { Text, View,ScrollView,FlatList,Modal,Button,StyleSheet,Alert,Share,PanResponder } from 'react-native';
import { Card,Icon,Rating,Input } from 'react-native-elements';
import { connect } from 'react-redux';
import { baseUrl } from '../shared/baseUrl';
import {postFavorite,postComment} from '../redux/ActionCreators';
import * as Animatable from 'react-native-animatable';
//import { Stars } from 'react-native-stars';


const mapStateToProps = state => {
    return {
      dishes: state.dishes,
      comments: state.comments,
      favorites:state.favorites
    }
  }

const mapDispatchToProps = dispatch =>({
    postFavorite: (dishId) => dispatch(postFavorite(dishId)),
    postComment: (dishId,rating,author,comment) => dispatch(postComment(dishId, rating, author, comment))
})

function RenderDish(props) {

    const dish = props.dish;

    handleViewRef = ref => this.view = ref;

    const recognizeDrag = ({ moveX, moveY, dx, dy }) => {
        if ( dx < -200 ){
            return true;
        }
            
        else{
            return false;
        }
            
    };    
    const recognizeComment = ({ dx }) => {
		if (dx > 200) return true; // Left to right
		return false;
	};                                                                                                                                                                                                                                                                                                                                                              

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: (e, gestureState) => {
            return true;
        },
        onPanResponderGrant: () => {this.view.rubberBand(1000).then(endState => console.log(endState.finished ? 'finished' : 'cancelled'));},  
        onPanResponderEnd: (e, gestureState) => {
            console.log("pan responder end", gestureState);
            if (recognizeDrag(gestureState)){
                Alert.alert(
                    'Add Favorite',
                    'Are you sure you wish to add ' + dish.name + ' to favorite?',
                    [
                    {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                    {text: 'OK', onPress: () => {props.favorite ? console.log('Already favorite') : props.onPress()}},
                    ],
                    { cancelable: false }
                );
            }else if(recognizeComment(gestureState)){
                props.toggleModal();
            }
            return true;
        }
    });

    const shareDish = (title,message,url)=>{
        Share.share({
            title:title,
            message: title + ': ' +message+ ' ' +url,
            url: url
        },{
            dialogTitle:'Share to Whom'+ title
        });
    }

        if (dish != null) {
            return(
                <Animatable.View animation="fadeInDown" duration={2000} delay={1000} 
                ref={this.handleViewRef}
                    {...panResponder.panHandlers}>
                <Card
                featuredTitle={dish.name}
                image={{uri: baseUrl + dish.image}}>
                    <Text style={{margin: 10}}>
                        {dish.description}
                    </Text>
                    <View style={{justifyContent:"center",alignItems:"center",flexDirection:"row"}}>
                    <Icon 
                        raised
                        reverse
                        name={props.favorite?'heart':'heart-o'}
                        type='font-awesome'
                        color='#f50'
                        onPress={()=> props.favorites ? console.log('Already fav'): props.onPress()} />

                    <Icon 
                        raised
                        reverse
                        name='pencil'
                        type='font-awesome'
                        color='#512DA8'
                        onPress={()=> props.toggleModal()} />

                    <Icon
                        raised
                        reverse
                        name='share'
                        type='font-awesome'
                        color='#51D2A8'
                        style={styles.cardItem}
                        onPress={() => shareDish(dish.name, dish.description, baseUrl + dish.image)} />
                </View>
                </Card>
                </Animatable.View> 
            );
        }
        else {
            return(<View></View>);
        }
}

function RenderComments(props){
    const comments =props.comments;
    const renderCommentItem = ({item,index}) => {
        return(
            <View key={index} style={{margin:9}}>
                <Text style={{fontSize:14}}>{item.comment}</Text>
                <Text style={{fontSize:12}}>{'Rating: '+item.rating}</Text>
                <Text style={{fontSize:12}}>{'--' + item.author+', ' + item.date}</Text>
            </View>
        );
    }

    return(
        <Animatable.View animation="fadeInUp" duration={2000} delay={1000}>   
        <Card title="Comments">
            <FlatList data={comments} renderItem={renderCommentItem} keyExtractor={item=>item.id.toString()} />
        </Card>
        </Animatable.View>
    );
}

class Dishdetail extends Component {

    constructor(props) {
        super(props);

        this.state = {
            showModal: false,
            rating:0,
            author:'',
            comment:''
        }
    }

    markFavorite(dishId){
        this.props.postFavorite(dishId);
    }

    static navigationOptions ={
        title : 'Dish Details'
    }

    toggleModal() {
        this.setState({showModal: !this.state.showModal});
    }

    // handleSubmit(){
    //     this.props.postComment(this.props.dishId, this.state.rating, this.state.author, this.state.comment);
    //     this.toggleModal();    
    // }

    handleSubmit=(dishId,rating,author,comments)=>{
        this.props.postComment(dishId,rating,author,comments)
        this.toggleModal()
    }

    render(){
        const dishId = this.props.navigation.getParam('dishId','')
     
        return(
            <ScrollView>
                <RenderDish dish={this.props.dishes.dishes[+dishId]} 
                            favorite = {this.props.favorites.some(el=>el===dishId)} 
                            onPress={()=> this.markFavorite(dishId)}
                            toggleModal={() => this.toggleModal()} />
                <RenderComments comments={this.props.comments.comments.filter((comment)=> comment.dishId===dishId)} />


                <Modal
                    animationType={'slide'}
                    transparent={false}
                    visible={this.state.showModal}
                    onDismiss={() => this.toggleModal()}
                    onRequestClose={() => this.toggleModal()}
                >
                    <View style={styles.modal}>
                        <Rating showRating fractions="{1}"
                            style={styles.modalText}
                            onFinishRating={(value) => this.setState({ rating: value })}
                        />
                        <Input
                            style={styles.modalText}
                            placeholder=' Author'
                            leftIcon={{ type: 'font-awesome', name: 'user-o' }}
                            onChangeText={(value) => this.setState({ author: value })}
                        />
                        <Input
                            style={styles.modalText}
                            placeholder=' Comment'
                            leftIcon={{ type: 'font-awesome', name: 'comment-o' }}
                            onChangeText={(value) => this.setState({ comment: value })}
                        />
                        <View style={styles.modalText}>
                            <Button
                                onPress={() => { this.handleSubmit(dishId, this.state.rating, this.state.author, this.state.comment); }}
                                color='#512DA8'
                                title='Submit'
                            />
                        </View>
                        <View style={styles.modalText}>
                            <Button
                                onPress={() => { this.toggleModal() }}
                                color='#A9A9A9'
                                title='Cancel'
                            />
                        </View>
                    </View>
                </Modal>
            </ScrollView>
        );
    }
}


const styles = StyleSheet.create({
    modal: {
        justifyContent: 'center',
        margin: 20
    },
    modalText: {
        fontSize: 18,
        margin: 10
    }

});

export default connect(mapStateToProps, mapDispatchToProps)(Dishdetail);