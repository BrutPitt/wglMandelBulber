// JavaScript source code


function ArcBall ()
{
    this.width = 0;
    this.height = 0;
    this.dragging = false;
    this.vecNew = vec3.clone([0,0,0]);
    this.vecOld = vec3.clone([0,0,0]);
    this.quatNew = quat.create();
    this.quatOld = quat.create();


    
    this.screen2Vector = function (x1, y1) {
        var v = vec2.clone([ ((x1 / ((this.width - 1) / 2)) - 1), -((y1 / ((this.height - 1) / 2)) - 1) ]);

        var len = vec2.length(v);;

        return vec3.clone((len > 1.0) ? [v[0] / Math.sqrt(len), v[1] / Math.sqrt(len), 0] : [v[0], v[1], Math.sqrt(1.0 - len)]);

    }

    this.start = function(x, y) 
    {
        this.dragging = true;
        this.vecOld = this.screen2Vector(x, y);
        quat.copy(this.quatOld,this.quatNew);

    }

    this.stop = function() 
    {
        this.dragging = false;

    }

    this.drag = function(x, y)
    {
        if (this.dragging) {
            this.vecNew = this.screen2Vector(x, y);

            
            var p = vec3.cross(vec3.create(), this.vecOld, this.vecNew);
            
            if (vec3.length(p) > 1e-5) {
                var val = vec3.dot(this.vecOld, this.vecNew);
                var q = quat.normalize(quat.create(), [p[0], p[1], p[2], val]);
                //var q = quat.clone([vec3.dot(this.vecOld, this.vecNew), p[0], p[1], p[2]]);
                quat.cross(this.quatNew, q, this.quatOld);
            } else {
                var q = quat.create();
                quat.cross(this.quatNew, q, this.quatOld);
            }
        }
        

    }

    this.setWindowSize = function(w, h)
    {
        this.width = w;
        this.height = h;

    }

    this.rotation = function(w)
    {
        mat3.fromQuat(w, this.quatNew);
    }


}

/*
public:
        ArcBall() : mWidth(0), mHeight(0) {}

    void Begin(int x, int y);
    void End();
    void Drag(int x, int y);
    void SetWindowSize(int width, int height);
    const glm::mat3 Rotation() const { return glm::mat3_cast(mQuatNow); }

private:
        glm::vec3 ScreenToVector(float screenX, float screenY);

    int mWidth, mHeight;
    bool mDragging;
    glm::quat mQuatNow, mQuatDown;
    glm::vec3 mVecNow, mVecDown;
};


//-----------------------------------------------------------------------------
// ArcBall
//-----------------------------------------------------------------------------
void ArcBall::Begin(int x, int y) {
}
//-----------------------------------------------------------------------------
void ArcBall::End() {

}
//-----------------------------------------------------------------------------
void ArcBall::Drag(int x, int y) {
    if (mDragging) {
        mVecNow = ScreenToVector(static_cast<float>(x), static_cast<float>(y));

glm::vec3 p = glm::cross(mVecDown, mVecNow);

if (glm::length(p) > 1e-5) {
    glm::quat q = glm::quat(glm::dot(mVecDown, mVecNow), p);
    mQuatNow = glm::cross(glm::normalize(q), mQuatDown);
}
else {
            mQuatNow = glm::cross(glm::quat(), mQuatDown);
}
}
}
//-----------------------------------------------------------------------------
void ArcBall::SetWindowSize(int width, int height) {
    mWidth = width;
mHeight = height;
}
//-----------------------------------------------------------------------------
glm::vec3 ArcBall::ScreenToVector(float screenX, float screenY) {
    glm::vec2 v;
v.x = ((screenX / ((mWidth - 1) / 2)) - 1);
v.y = -((screenY / ((mHeight - 1) / 2)) - 1);

float len = glm::length(v);
if (len > 1.0f)
return glm::vec3(v / sqrt(len), 0);

return glm::vec3(v, sqrt(1.0f - len));
}
//-----------------------------------------------------------------------------
  */