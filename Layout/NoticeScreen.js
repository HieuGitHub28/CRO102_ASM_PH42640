import { FlatList, Image, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { URL } from './HomeScreen';
import AsyncStorage from '@react-native-async-storage/async-storage'

const NoticeScreen = ({navigation}) => {

  const [data, setdata] = useState([]);
  const [dataCart, setdataCart] = useState([]);
  const [dataPl, setdataPl] = useState([]);
  const [dataPlt, setdataPlt] = useState([]);
  const [user, setuser] = useState([]);
  const [loading, setloading] = useState(true);


  // lấy user từ AsyncStorage
  const retrieveData = async () => {
    try {
      const UserData = await AsyncStorage.getItem('User');
      if (UserData != null) {
        setuser(JSON.parse(UserData));
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    retrieveData()
  }, [])

  const getData = async () => {
    console.log(user);
    const url = `${URL}/hoadons`
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const sortedData = data.sort((a, b) => new Date(b.ngayMua) - new Date(a.ngayMua));
      setdata(sortedData);
      setloading(false);
      console.log(data);
    }
  }

  const getDataCart = async () => {
    const url = `${URL}/carts`
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      setdataCart(data);
    }
  }

  const getDataPl = async () => {
    const url = `${URL}/plants`
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      setdataPl(data);
    }
  }

  const getDataPlt = async () => {
    const url = `${URL}/plantas`
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      setdataPlt(data);
    }
  }



  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // cập nhật giao diện ở đây
      getDataPl();
      getDataPlt();
      getData();
      getDataCart();
    });

    return unsubscribe;

  }, [navigation])

  const formatPrice = (price) => {
    if (price !== undefined && price !== null) {
      return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    } else {
      return ""; // Hoặc trả về một giá trị mặc định khác nếu cần
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const daysOfWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const dayIndex = d.getDay(); // Lấy chỉ số của ngày trong tuần (0 là Chủ Nhật, 1 là Thứ Hai, ..., 6 là Thứ Bảy)
    const day = d.getDate().toString().padStart(2, '0'); // Lấy ngày và thêm '0' ở trước nếu cần
    const month = (d.getMonth() + 1).toString().padStart(2, '0'); // Lấy tháng (phải cộng thêm 1 vì index của tháng bắt đầu từ 0) và thêm '0' ở trước nếu cần
    const year = d.getFullYear();

    return `${daysOfWeek[dayIndex]}, ${day}/${month}/${year}`; // Trả về ngày đã định dạng
  };


  const renderItem = ({ item }) => {

    const Cart = dataCart.filter(c => c.id_bill == item.id);
    // console.log(Cart);
    sl = 0;
    for (const item of Cart) {
      sl += item.soLuongMua;
    }
    const id_pro = Cart[0]?.id_Product;
    const Plant = dataPl.find(pl => pl.id == id_pro);
    // console.log(Plant);
    const Planta = dataPlt.find(plt => plt.id == id_pro);
    // console.log(Planta);


    return (
      <View>
        <Text>{formatDate(item.ngayMua)}</Text>
        <View style={styles.item}>
          <Image source={{ uri: Plant?.img || Planta?.img }} style={styles.image} />
          <View style={{ padding: 20, justifyContent: 'space-between', gap: 10 }}>
            {item.status == 0 ? <Text style={{ color: 'green', fontSize: 16, fontWeight: 'bold' }}>Đặt hàng thành công</Text>
              : <Text style={{ color: 'red', fontSize: 16, fontWeight: 'bold' }}>Đã hủy đơn hàng</Text>}
            <Text>{Plant?.name || Planta?.name} | <Text style={{ color: 'gray' }}>{Plant?.type || Planta?.type ? 'Ưa bóng' : 'Ưa râm'}
            </Text></Text>
            <Text>mua {sl} sản phẩm</Text>
            <Text>Tổng tiền : {formatPrice(item.total)}</Text>
          </View>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={{ textAlign: 'center', fontSize: 18, fontWeight: 'bold' }}>THÔNG BÁO</Text>
      </View>

      {data.filter(i => i.id_User == user.id).length == 0
        ? <View style={{}}>
          <Text style={{ textAlign: 'center' }}>Hiện chưa có thông báo nào cho bạn</Text>
        </View>
        :
        <FlatList showsVerticalScrollIndicator={false}
          data={data.filter(i => i.id_User == user.id)}
          keyExtractor={item => item.id}
          renderItem={renderItem}></FlatList>}


    </View>
  )
}

export default NoticeScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 16
  },
  header: {
    width: "100%",
    paddingVertical: 20
  },
  image: {
    width: 120,
    height: 120,
  },
  item: {
    height: 160,
    flexDirection: 'row',
    alignItems: 'center', borderTopWidth: 1, width: '100%',
    gap: 20
  },
})