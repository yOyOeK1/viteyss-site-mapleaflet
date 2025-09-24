import numpy as np
import matplotlib.pyplot as plt



zt = [[3, 2, None, 12, 13, 14, 15, 16],
    [1, 1, None, 11, 3,3, 9, 17],
    [None, 2, 6, 7, 1, 3, 8, 18],
    [None, 3, None, 8, 1, 2, 9, 19],
    [55, 4, 10, 9, 1, 2, 3, 20],
    [None, None, None, 27, 20, 19, 20, 21],
    [None, None, None, 26, 25, 24, 23, 22]]

def arrayToSvg( z, fileTo ):
    print( f" len:{len(z)} over {len(z[0])}" )
    xLen = len(z[0])
    yLen= len(z)
    x = np.arange( xLen )
    y = np.arange( yLen )
    X,Y = np.meshgrid(x,y)

    plt.contourf(X, Y, z, .5, alpha=1., cmap=plt.cm.cividis)


    # labels on line
    #C = plt.contour(X, Y, z, 8, colors='black', linewidth=.5)
    #plt.clabel(C, inline=1, fontsize=8)

    plt.axis('off')
    plt.gca().set_position([0, 0, 1, 1])

    if fileTo == 'show':
        plt.show()
    else:
        plt.savefig(fileTo,transparent=True)
        #plt.savefig(fileTo,transparent=False)


if __name__ == "__main__":
    print( "Run test...")
    arrayToSvg(zt, 'show')
    arrayToSvg(zt, "arrayTestSvg_res_test1.svg")

